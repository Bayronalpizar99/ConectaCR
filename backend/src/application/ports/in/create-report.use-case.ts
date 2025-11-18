import { Report } from "../../../domain/model/report";

export interface CreateReportUseCase {
  createReport(report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<Report>;
}
