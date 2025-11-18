import { Report } from '../../../domain/model/report';

export interface GetReportsUseCase {
  findAll(): Promise<Report[]>;
}
