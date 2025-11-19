import { User as PrismaUser } from '@prisma/client';
import { User } from '@/modules/user/domain/entities';
import { Email, Password } from '@/modules/user/domain/value-objects';

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    const email = Email.create(prismaUser.email);
    const password = Password.fromHash(prismaUser.password);

    return User.reconstitute(
      prismaUser.id,
      email,
      password,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }

  static toPrisma(user: User): {
    id: string;
    email: string;
    password: string;
  } {
    return {
      id: user.getId(),
      email: user.getEmail().getValue(),
      password: user.getPassword().getValue(),
    };
  }

  static toPrismaCreate(user: User): {
    email: string;
    password: string;
  } {
    return {
      email: user.getEmail().getValue(),
      password: user.getPassword().getValue(),
    };
  }

  static toPrismaUpdate(user: User): {
    email: string;
    password: string;
  } {
    return {
      email: user.getEmail().getValue(),
      password: user.getPassword().getValue(),
    };
  }

  static toDomainArray(prismaUsers: PrismaUser[]): User[] {
    return prismaUsers.map((prismaUser) => this.toDomain(prismaUser));
  }
}
