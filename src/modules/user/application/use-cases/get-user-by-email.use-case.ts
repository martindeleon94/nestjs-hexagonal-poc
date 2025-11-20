import { IsEmail, IsNotEmpty } from 'class-validator';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { USER_REPOSITORY } from '@/modules/user/domain/ports';
import type { IUserRepositoryPort } from '@/modules/user/domain/ports';
import { Email } from '@/modules/user/domain/value-objects';

export class GetUserByEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export interface IGetUserByEmailResponseDto {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetUserByEmailUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepositoryPort,
  ) {}

  async execute(dto: GetUserByEmailDto): Promise<IGetUserByEmailResponseDto> {
    let email: Email;

    try {
      email = Email.create(dto.email);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid email';
      throw new BadRequestException(message);
    }

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plainUser = user.toPlainObject();

    return {
      id: plainUser.id,
      email: plainUser.email,
      createdAt: plainUser.createdAt,
      updatedAt: plainUser.updatedAt,
    };
  }
}
