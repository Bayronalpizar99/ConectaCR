import { api } from '../lib/api';
import { Report, ReportStatus } from '../types';

type CreateReportPayload = Omit<Report, 'id' | 'createdAt' | 'updatedAt'> & {
  imageDataUrl?: string;
};

export const reportService = {
  getReports: async (): Promise<Report[]> => {
    return api.get('reports');
  },
  createReport: async (payload: CreateReportPayload): Promise<Report> => {
    return api.post('reports', payload);
  },
  updateStatus: async (id: string, status: ReportStatus): Promise<Report> => {
    return api.patch(`reports/${id}/status`, { status });
  },
};
