export type UserRole = 'citizen' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

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

export interface Report {
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
  imageFile?: File;
  imageDataUrl?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORY_LABELS: Record<ReportCategory, string> = {
  bache: 'Bache en vía',
  alumbrado: 'Falla en alumbrado público',
  semaforo: 'Avería en semáforo',
  alcantarilla: 'Alcantarilla obstruida',
  fuga_agua: 'Fuga de agua potable',
  red_electrica: 'Daño en red eléctrica',
  accidente: 'Accidente de tránsito',
  inundacion: 'Inundación',
  deslizamiento: 'Deslizamiento de tierra',
  otros: 'Otros'
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  recibido: 'Recibido',
  en_progreso: 'En Progreso',
  resuelto: 'Resuelto'
};

export interface Notification {
  id: string;
  userId: string;
  reportId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
