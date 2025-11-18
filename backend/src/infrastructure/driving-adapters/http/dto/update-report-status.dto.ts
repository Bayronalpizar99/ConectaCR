import { IsIn, IsString } from 'class-validator';
import type { ReportStatus } from '../../../../domain/model/report';

export class UpdateReportStatusDto {
  @IsString()
  @IsIn(['recibido', 'en_progreso', 'resuelto'])
  status: ReportStatus;
}
