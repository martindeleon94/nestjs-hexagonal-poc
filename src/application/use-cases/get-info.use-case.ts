import { Inject, Injectable } from '@nestjs/common';
import { IGetInfoUseCase } from '@/domain/contracts/get-info-use-case.interface';
import { INFRASTRUCTURE_TOKENS } from '@/application/config/tokens';
import type { IEnvironmentService } from '@/domain/contracts/environment-service.interface';
import { IInfoResponseDTO } from '@/domain/contracts/dtos/info-response.dto';
import { APP_NAME } from '@/domain/constants/app.constants';

@Injectable()
export class GetInfoUseCase implements IGetInfoUseCase {
  constructor(
    @Inject(INFRASTRUCTURE_TOKENS.ENVIRONMENT_SERVICE)
    private readonly environmentService: IEnvironmentService,
  ) {}

  execute(): Promise<IInfoResponseDTO> {
    return Promise.resolve({
      appName: APP_NAME,
      port: this.environmentService.getPort(),
      environment: this.environmentService.getNodeEnv(),
      databaseUrl: this.environmentService.getDatabaseUrl(),
    });
  }
}
