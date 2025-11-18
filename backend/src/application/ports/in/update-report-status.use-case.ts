import { Report } from '../../../domain/model/report';

export interface UpdateReportStatusUseCase {
  updateStatus(id: string, status: Report['status']): Promise<Report>;
}
