import { Report } from "../../../domain/model/report";

export interface ReportRepository {
  save(report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<Report>;
  findAll(): Promise<Report[]>;
  updateStatus(id: string, status: Report['status']): Promise<Report>;
}
