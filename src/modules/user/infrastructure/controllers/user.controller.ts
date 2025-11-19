import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  RegisterUserUseCase,
  RegisterUserDto,
  IRegisterUserResponseDto,
} from '../../application/use-cases';

@Controller('users')
export class UserController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterUserDto,
  ): Promise<IRegisterUserResponseDto> {
    return this.registerUserUseCase.execute(dto);
  }
}
