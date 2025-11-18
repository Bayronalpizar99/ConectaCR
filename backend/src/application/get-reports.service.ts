import { Inject, Injectable } from '@nestjs/common';
import { GetReportsUseCase } from './ports/in/get-reports.use-case';
import type { ReportRepository } from './ports/out/report.repository';
import type { Report } from '../domain/model/report';

@Injectable()
export class GetReportsService implements GetReportsUseCase {
  constructor(
    @Inject('ReportRepository')
    private readonly reportRepository: ReportRepository,
  ) {}

  findAll(): Promise<Report[]> {
    return this.reportRepository.findAll();
  }
}
