import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: 'pretty',
    });

    const prismaClient = this as unknown as {
      $on: (event: string, callback: (e: unknown) => void) => void;
    };

    prismaClient.$on('query', (e: unknown) => {
      if (process.env.PRISMA_QUERY_LOG === 'true') {
        const event = e as { query: string; params: string; duration: number };
        this.logger.debug(`Query: ${event.query}`);
        this.logger.debug(`Params: ${event.params}`);
        this.logger.debug(`Duration: ${event.duration}ms`);
      }
    });

    prismaClient.$on('error', (e: unknown) => {
      const event = e as { message: string };
      this.logger.error(`Prisma Error: ${event.message}`);
    });
  }
  async onModuleInit(): Promise<void> {
    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        await this.$connect();
        this.logger.log('Successfully connected to database');
        return;
      } catch (error) {
        attempt++;

        if (attempt >= maxRetries) {
          this.logger.error(
            `Failed to connect to database after ${maxRetries} attempts`,
            error,
          );
          throw error;
        }

        const delay = Math.pow(2, attempt) * 1000; // Backoff exponencial: 2s, 4s, 8s, 16s
        this.logger.warn(
          `Database connection failed. Retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      this.logger.log('Successfully disconnected from database');
    } catch (error) {
      this.logger.error('Error disconnecting from database', error);
    }
  }
  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    try {
      await this.$executeRawUnsafe('SET session_replication_role = replica;');

      const modelKeys = Object.keys(this).filter(
        (key) =>
          !key.startsWith('_') &&
          !key.startsWith('$') &&
          typeof (this as Record<string, unknown>)[key] === 'object',
      );

      const deletePromises = modelKeys.map(async (modelKey) => {
        const model = (this as Record<string, unknown>)[modelKey] as {
          deleteMany?: () => Promise<unknown>;
        };

        if (model && typeof model.deleteMany === 'function') {
          try {
            await model.deleteMany();
          } catch (error) {
            this.logger.warn(`Failed to clean table ${modelKey}: ${error}`);
          }
        }
      });

      await Promise.all(deletePromises);
      await this.$executeRawUnsafe('SET session_replication_role = DEFAULT;');

      this.logger.log('Database cleaned successfully');
    } catch (error) {
      this.logger.error('Failed to clean database', error);
      throw error;
    }
  }

  async executeInTransaction<T>(
    fn: (prisma: PrismaClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (prisma) => {
      return fn(prisma as PrismaClient);
    });
  }
}
