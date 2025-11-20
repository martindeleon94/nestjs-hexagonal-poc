import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
} from '@nestjs/common';
import {
  RegisterUserUseCase,
  RegisterUserDto,
  IRegisterUserResponseDto,
  GetUserByEmailDto,
  GetUserByEmailUseCase,
  IGetUserByEmailResponseDto,
} from '../../application/use-cases';

@Controller('users')
export class UserController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterUserDto,
  ): Promise<IRegisterUserResponseDto> {
    return this.registerUserUseCase.execute(dto);
  }

  @Get('by-email/:email')
  @HttpCode(HttpStatus.OK)
  async getByEmail(
    @Param('email') email: string,
  ): Promise<IGetUserByEmailResponseDto> {
    const dto = new GetUserByEmailDto();
    dto.email = email;
    return this.getUserByEmailUseCase.execute(dto);
  }
}
