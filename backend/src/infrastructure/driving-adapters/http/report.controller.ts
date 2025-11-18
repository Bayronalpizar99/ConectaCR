import { Body, Controller, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import type { CreateReportUseCase } from '../../../application/ports/in/create-report.use-case';
import type { GetReportsUseCase } from '../../../application/ports/in/get-reports.use-case';
import type { UpdateReportStatusUseCase } from '../../../application/ports/in/update-report-status.use-case';
import { Report } from '../../../domain/model/report';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { SupabaseStorageService } from '../../supabase/supabase-storage.service';

@Controller('reports')
export class ReportController {
  constructor(
    @Inject('CreateReportUseCase')
    private readonly createReportUseCase: CreateReportUseCase,
    @Inject('GetReportsUseCase')
    private readonly getReportsUseCase: GetReportsUseCase,
    @Inject('UpdateReportStatusUseCase')
    private readonly updateReportStatusUseCase: UpdateReportStatusUseCase,
    private readonly storageService: SupabaseStorageService,
  ) {}

  @Get()
  async findAll(): Promise<Report[]> {
    return this.getReportsUseCase.findAll();
  }

  @Post()
  async createReport(@Body() createReportDto: CreateReportDto): Promise<Report> {
    const { imageDataUrl, ...rest } = createReportDto;
    let imageUrl: string | undefined;

    if (imageDataUrl) {
      imageUrl = await this.storageService.uploadBase64Image(imageDataUrl, rest.userId);
    }

    return this.createReportUseCase.createReport({
      ...rest,
      imageUrl,
    });
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateReportStatusDto,
  ): Promise<Report> {
    return this.updateReportStatusUseCase.updateStatus(id, body.status);
  }
}
