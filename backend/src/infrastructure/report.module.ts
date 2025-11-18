import { Module } from '@nestjs/common';
import { SupabaseModule } from './supabase/supabase.module';
import { ReportController } from './driving-adapters/http/report.controller';
import { CreateReportService } from '../application/create-report.service';
import { GetReportsService } from '../application/get-reports.service';
import { UpdateReportStatusService } from '../application/update-report-status.service';
import { ReportAdapter } from './driven-adapters/supabase/report.adapter';

@Module({
  imports: [SupabaseModule],
  controllers: [ReportController],
  providers: [
    {
      provide: 'CreateReportUseCase',
      useClass: CreateReportService,
    },
    {
      provide: 'GetReportsUseCase',
      useClass: GetReportsService,
    },
    {
      provide: 'UpdateReportStatusUseCase',
      useClass: UpdateReportStatusService,
    },
    {
      provide: 'ReportRepository',
      useClass: ReportAdapter,
    },
  ],
})
export class ReportModule {}
