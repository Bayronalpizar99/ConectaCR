import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import type { ReportCategory, ReportStatus } from '../../../../domain/model/report';

const CATEGORY_VALUES = [
  'bache',
  'alumbrado',
  'semaforo',
  'alcantarilla',
  'fuga_agua',
  'red_electrica',
  'accidente',
  'inundacion',
  'deslizamiento',
  'otros',
] as const;

const STATUS_VALUES = ['recibido', 'en_progreso', 'resuelto'] as const;

class LocationDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsString()
  @IsNotEmpty()
  address: string;
}

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsIn(CATEGORY_VALUES as readonly string[])
  category: ReportCategory;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsString()
  @IsIn(STATUS_VALUES as readonly string[])
  status: ReportStatus;

  @IsOptional()
  @IsString()
  imageDataUrl?: string;
}
