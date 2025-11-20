import { Injectable, Logger } from '@nestjs/common';
import { User } from '@/modules/user/domain/entities';
import { IUserRepositoryPort } from '@/modules/user/domain/ports';
import { Email } from '@/modules/user/domain/value-objects';
import { PrismaService } from '@/shared/infrastructure/persistence/prisma';
import { UserMapper } from './mappers';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements IUserRepositoryPort {
  private readonly logger = new Logger(PrismaUserRepository.name);

  constructor(private readonly prisma: PrismaService) {}
  async save(user: User): Promise<void> {
    try {
      const data = UserMapper.toPrismaUpdate(user);

      await this.prisma.user.upsert({
        where: { id: user.getId() },
        create: {
          id: user.getId(),
          ...data,
        },
        update: data,
      });

      this.logger.log(`User saved successfully: ${user.getId()}`);
    } catch (error) {
      this.logger.error(`Error saving user: ${user.getId()}`, error);
      this.handlePrismaError(error);
    }
  }
  async findById(id: string): Promise<User | null> {
    try {
      const prismaUser = await this.prisma.user.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!prismaUser) {
        this.logger.debug(`User not found or deleted: ${id}`);
        return null;
      }

      return UserMapper.toDomain(prismaUser);
    } catch (error) {
      this.logger.error(`Error finding user by id: ${id}`, error);
      this.handlePrismaError(error);
    }
  }
  async findByEmail(email: Email): Promise<User | null> {
    try {
      const emailValue = email.getValue();

      const prismaUser = await this.prisma.user.findFirst({
        where: {
          email: emailValue,
          deletedAt: null,
        },
      });

      if (!prismaUser) {
        this.logger.debug(
          `User not found or deleted with email: ${emailValue}`,
        );
        return null;
      }

      return UserMapper.toDomain(prismaUser);
    } catch (error) {
      this.logger.error(
        `Error finding user by email: ${email.getValue()}`,
        error,
      );
      this.handlePrismaError(error);
    }
  }

  async existsByEmail(email: Email): Promise<boolean> {
    try {
      const count = await this.prisma.user.count({
        where: {
          email: email.getValue(),
          deletedAt: null,
        },
      });

      return count > 0;
    } catch (error) {
      this.logger.error(
        `Error checking email existence: ${email.getValue()}`,
        error,
      );
      this.handlePrismaError(error);
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      this.logger.log(`User soft deleted: ${id}`);

      // hard delete:
      // await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      this.logger.error(`Error deleting user: ${id}`, error);
      this.handlePrismaError(error);
    }
  }
  async findAll(page: number, limit: number): Promise<User[]> {
    try {
      const skip = (page - 1) * limit;

      const prismaUsers = await this.prisma.user.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return UserMapper.toDomainArray(prismaUsers);
    } catch (error) {
      this.logger.error(
        `Error finding all users (page: ${page}, limit: ${limit})`,
        error,
      );
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: any): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002': {
          const target = error.meta?.target;
          const field: string =
            Array.isArray(target) && target.length > 0
              ? String(target[0])
              : 'field';
          throw new Error(`${field} already exists`);
        }

        case 'P2025':
          throw new Error('User not found');

        case 'P2003':
          throw new Error('Cannot delete user: related records exist');

        default:
          this.logger.error(`Unhandled Prisma error: ${error.code}`, error);
          throw new Error('Database operation failed');
      }
    }

    throw new Error('Unexpected database error');
  }
}
