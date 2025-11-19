import {
  Injectable,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { User } from '../../domain/entities';
import { Email, Password } from '../../domain/value-objects';
import type { UserRepositoryPort } from '../../domain/ports';
import { USER_REPOSITORY } from '../../domain/ports';

export class RegisterUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export interface IRegisterUserResponseDto {
  id: string;
  email: string;
  createdAt: Date;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}
  async execute(dto: RegisterUserDto): Promise<IRegisterUserResponseDto> {
    let email: Email;
    let password: Password;

    try {
      email = Email.create(dto.email);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid email';
      throw new BadRequestException(message);
    }

    try {
      password = Password.create(dto.password);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Invalid password';
      throw new BadRequestException(message);
    }

    const emailExists = await this.userRepository.existsByEmail(email);

    if (emailExists) {
      throw new ConflictException('Email already registered');
    }
    const user = await User.create(email, password);

    await this.userRepository.save(user);

    const plainUser = user.toPlainObject();

    return {
      id: plainUser.id,
      email: plainUser.email,
      createdAt: plainUser.createdAt,
    };
  }
}
