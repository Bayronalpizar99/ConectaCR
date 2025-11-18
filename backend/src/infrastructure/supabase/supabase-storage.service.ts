import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStorageService {
  constructor(
    @Inject('Supabase') private readonly supabase: SupabaseClient,
    private readonly configService: ConfigService,
  ) {}

  async uploadBase64Image(dataUrl: string, userId: string): Promise<string> {
    const bucket = this.configService.get<string>('SUPABASE_STORAGE_BUCKET') ?? 'reports';
    const { buffer, contentType, extension } = this.parseDataUrl(dataUrl);
    const filePath = `${userId}/${Date.now()}.${extension}`;

    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw new Error(`Error uploading image to Supabase storage: ${error.message}`);
    }

    const { data } = this.supabase.storage.from(bucket).getPublicUrl(filePath);
    if (!data?.publicUrl) {
      throw new Error('Unable to obtain public URL for uploaded image');
    }

    return data.publicUrl;
  }

  private parseDataUrl(dataUrl: string): { buffer: Buffer; contentType: string; extension: string } {
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid image data URL');
    }

    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const extension = this.mimeTypeToExtension(contentType);

    return { buffer, contentType, extension };
  }

  private mimeTypeToExtension(mimeType: string): string {
    const mapping: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };

    return mapping[mimeType] ?? 'bin';
  }
}
