import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Report, CATEGORY_LABELS, STATUS_LABELS } from '../types';
import { Calendar, MapPin, User, Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ReportDetailsDialogProps {
  report: Report | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReportDetailsDialog({ report, open, onOpenChange }: ReportDetailsDialogProps) {
  if (!report) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{report.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {report.imageUrl && (
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <ImageWithFallback 
                src={report.imageUrl} 
                alt={report.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-slate-600 flex items-center gap-2">
                <User className="w-4 h-4" />
                Categoría
              </p>
              <p className="text-slate-900">{CATEGORY_LABELS[report.category]}</p>
            </div>

            <div className="space-y-1">
              <p className="text-slate-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Estado
              </p>
              <Badge 
                variant={
                  report.status === 'resuelto' ? 'default' : 
                  report.status === 'en_progreso' ? 'secondary' : 
                  'destructive'
                }
              >
                {STATUS_LABELS[report.status]}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-slate-600">Descripción</p>
            <p className="text-slate-900">{report.description}</p>
          </div>

          <div className="space-y-2">
            <p className="text-slate-600 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Ubicación
            </p>
            <p className="text-slate-900">{report.location.address}</p>
            <p className="text-slate-600">
              Coordenadas: {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <p className="text-slate-600 flex items-center gap-2">
                <User className="w-4 h-4" />
                Reportado por
              </p>
              <p className="text-slate-900">{report.userName}</p>
            </div>

            <div className="space-y-1">
              <p className="text-slate-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha
              </p>
              <p className="text-slate-900">{formatDate(report.createdAt)}</p>
            </div>
          </div>

          {report.updatedAt !== report.createdAt && (
            <div className="space-y-1">
              <p className="text-slate-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Última actualización
              </p>
              <p className="text-slate-900">{formatDate(report.updatedAt)}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
