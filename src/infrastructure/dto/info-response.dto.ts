import { IInfoResponseDTO } from '@/domain/contracts/dtos/info-response.dto';

export class InfoResponseDto implements IInfoResponseDTO {
  appName: string;
  port: number;
  environment: string;
  databaseUrl: string;
}
