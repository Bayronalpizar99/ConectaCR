import { Inject, Injectable } from '@nestjs/common';
import { UpdateReportStatusUseCase } from './ports/in/update-report-status.use-case';
import type { ReportRepository } from './ports/out/report.repository';
import type { Report } from '../domain/model/report';

@Injectable()
export class UpdateReportStatusService implements UpdateReportStatusUseCase {
  constructor(
    @Inject('ReportRepository')
    private readonly reportRepository: ReportRepository,
  ) {}

  updateStatus(id: string, status: Report['status']): Promise<Report> {
    return this.reportRepository.updateStatus(id, status);
  }
}
