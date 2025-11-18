import { IInfoResponseDTO } from '@/domain/contracts/dtos/info-response.dto';

export interface IGetInfoUseCase {
  execute(): Promise<IInfoResponseDTO>;
}
