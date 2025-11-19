import { Module } from '@nestjs/common';
import { UserController } from './controllers';
import { RegisterUserUseCase } from '../application/use-cases';
import { PrismaUserRepository } from './persistence/prisma';
import { USER_REPOSITORY } from '../domain/ports';
import { PrismaService } from '@/shared/infrastructure/persistence/prisma';

@Module({
  controllers: [UserController],
  providers: [
    PrismaService,
    RegisterUserUseCase,
    {
      provide: USER_REPOSITORY,
      useFactory: (prismaService: PrismaService) => {
        return new PrismaUserRepository(prismaService);
      },
      inject: [PrismaService],
    },
  ],
  exports: [USER_REPOSITORY, RegisterUserUseCase],
})
export class UserModule {}
