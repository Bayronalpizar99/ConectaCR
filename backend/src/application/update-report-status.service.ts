import { Inject, Injectable } from '@nestjs/common';
import { UpdateReportStatusUseCase } from './ports/in/update-report-status.use-case';
import type { ReportRepository } from './ports/out/report.repository';
import type { NotificationRepository } from './ports/out/notification.repository';
import type { Report } from '../domain/model/report';

@Injectable()
export class UpdateReportStatusService implements UpdateReportStatusUseCase {
  constructor(
    @Inject('ReportRepository')
    private readonly reportRepository: ReportRepository,
    @Inject('NotificationRepository')
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async updateStatus(id: string, status: Report['status']): Promise<Report> {
    const updatedReport = await this.reportRepository.updateStatus(id, status);

    // Create notification for the user
    await this.notificationRepository.create({
      userId: updatedReport.userId,
      reportId: updatedReport.id,
      title: 'Actualización de Reporte',
      message: `El estado de tu reporte "${updatedReport.title}" ha cambiado a: ${status.replace('_', ' ')}`,
      read: false,
    });

    return updatedReport;
  }
}
