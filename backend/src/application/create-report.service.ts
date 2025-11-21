import { Inject, Injectable } from '@nestjs/common';
import { CreateReportUseCase } from './ports/in/create-report.use-case';
import type { ReportRepository } from './ports/out/report.repository';
import type { Report } from '../domain/model/report';
import { NotificationService } from './notification.service';

@Injectable()
export class CreateReportService implements CreateReportUseCase {
  constructor(
    @Inject('ReportRepository')
    private readonly reportRepository: ReportRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async createReport(reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<Report> {
    const report = await this.reportRepository.save(reportData);

    const criticalCategories = ['inundacion', 'deslizamiento', 'accidente', 'red_electrica'];
    
    if (criticalCategories.includes(report.category)) {
      console.log(`Critical category detected: ${report.category}. Sending notifications to admins...`);
      // No bloqueamos la respuesta si falla la notificación
      this.notificationService.notifyAdmins(
        'URGENTE: Reporte de seguridad pública',
        `URGENTE: Reporte de seguridad pública en ${report.location.address || 'Ubicación desconocida'}. Categoría: ${report.category}`,
        report.id
      ).catch(err => console.error('Error sending admin notifications:', err));
    } else {
      console.log(`Category ${report.category} is not critical. No admin notification sent.`);
    }

    return report;
  }
}
