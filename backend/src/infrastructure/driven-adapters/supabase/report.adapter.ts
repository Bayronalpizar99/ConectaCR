import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { ReportRepository } from '../../../application/ports/out/report.repository';
import { Report } from '../../../domain/model/report';

@Injectable()
export class ReportAdapter implements ReportRepository {
  constructor(
    @Inject('Supabase') private readonly supabase: SupabaseClient
  ) {}

  async save(report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<Report> {
    const payload = {
      user_id: report.userId,
      user_name: report.userName,
      category: report.category,
      title: report.title,
      description: report.description,
      location: report.location,
      image_url: report.imageUrl ?? null,
      status: report.status,
    };

    const { data, error } = await this.supabase
      .from('reports')
      .insert([payload])
      .select()
      .single();

    if (error) {
      throw new Error(`Error saving report to Supabase: ${error.message}`);
    }

    return this.mapToDomain(data);
  }

  async findAll(): Promise<Report[]> {
    const { data, error } = await this.supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching reports from Supabase: ${error.message}`);
    }

    return (data ?? []).map((item) => this.mapToDomain(item));
  }

  async updateStatus(id: string, status: Report['status']): Promise<Report> {
    const { error } = await this.supabase
      .from('reports')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Error updating report status in Supabase: ${error.message}`);
    }

    const { data: updatedRow, error: fetchError } = await this.supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Report with id ${id} not found after update: ${fetchError.message}`);
    }

    return this.mapToDomain(updatedRow);
  }

  private mapToDomain(row: any): Report {
    if (!row) {
      throw new Error('Supabase returned an empty report payload');
    }

    return {
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      category: row.category,
      title: row.title,
      description: row.description,
      location: row.location,
      imageUrl: row.image_url ?? undefined,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
