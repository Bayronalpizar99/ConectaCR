export type ReportCategory = 
  | 'bache'
  | 'alumbrado'
  | 'semaforo'
  | 'alcantarilla'
  | 'fuga_agua'
  | 'red_electrica'
  | 'accidente'
  | 'inundacion'
  | 'deslizamiento'
  | 'otros';

export type ReportStatus = 'recibido' | 'en_progreso' | 'resuelto';

export class Report {
  id: string;
  userId: string;
  userName: string;
  category: ReportCategory;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  imageUrl?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}
