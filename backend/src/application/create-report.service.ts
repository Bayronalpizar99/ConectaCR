import { Inject, Injectable } from '@nestjs/common';
import { CreateReportUseCase } from './ports/in/create-report.use-case';
import type { ReportRepository } from './ports/out/report.repository';
import type { Report } from '../domain/model/report';

@Injectable()
export class CreateReportService implements CreateReportUseCase {
  constructor(
    @Inject('ReportRepository')
    private readonly reportRepository: ReportRepository,
  ) {}

  async createReport(reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<Report> {
    return this.reportRepository.save(reportData);
  }
}
