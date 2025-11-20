import { Controller, Get, Inject, HttpStatus, HttpCode } from '@nestjs/common';
import type { IGetHealthUseCase } from '@/domain/contracts/get-health-use-case.interface';
import type { IGetInfoUseCase } from '@/domain/contracts/get-info-use-case.interface';
import { HEALTH_TOKENS } from '@/application/config/tokens';
import { HealthResponseDto } from '../dto/health-response.dto';
import { InfoResponseDto } from '@/infrastructure/dto/info-response.dto';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(HEALTH_TOKENS.GET_HEALTH_USE_CASE)
    private readonly getHealthUseCase: IGetHealthUseCase,
    @Inject(HEALTH_TOKENS.GET_INFO_USE_CASE)
    private readonly getInfoUseCase: IGetInfoUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async check(): Promise<HealthResponseDto> {
    return this.getHealthUseCase.execute();
  }

  @Get('info')
  @HttpCode(HttpStatus.OK)
  async getInfo(): Promise<InfoResponseDto> {
    return this.getInfoUseCase.execute();
  }
}
