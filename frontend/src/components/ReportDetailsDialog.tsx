import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Report, CATEGORY_LABELS, STATUS_LABELS } from '../types';
import { Calendar, MapPin, User, Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useEffect, useMemo, useRef, useState } from 'react';

interface ReportDetailsDialogProps {
  report: Report | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReportDetailsDialog({ report, open, onOpenChange }: ReportDetailsDialogProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const revokeRef = useRef<string | null>(null);

  // Deriva una fuente persistente si existe
  const persistedSrc = useMemo(() => {
    if (!report) return null;
    const anyReport = report as any;
    if (typeof anyReport?.imageDataUrl === 'string' && anyReport.imageDataUrl.length > 0) return anyReport.imageDataUrl;
    if (typeof anyReport?.imageUrl === 'string' && anyReport.imageUrl.length > 0) return anyReport.imageUrl;
    return null;
  }, [report]);

  useEffect(() => {
    if (!report) return;

    // Limpia cualquier blob anterior
    if (revokeRef.current && revokeRef.current.startsWith('blob:')) {
      try { URL.revokeObjectURL(revokeRef.current); } catch {}
      revokeRef.current = null;
    }

    const f: unknown = (report as any)?.imageFile;

    // Caso 1: tenemos un File/Blob (solo en la misma sesión)
    if (f instanceof Blob) {
      try {
        const url = URL.createObjectURL(f);
        revokeRef.current = url;
        setImgSrc(url);
        return () => {
          if (revokeRef.current) {
            try { URL.revokeObjectURL(revokeRef.current); } catch {}
            revokeRef.current = null;
          }
        };
      } catch {
        setImgSrc(null);
      }
      return;
    }

    // Caso 2: después del refresh: usar persistedSrc (dataURL o URL normal)
    if (persistedSrc) {
      setImgSrc(persistedSrc);
    } else {
      setImgSrc(null);
    }

    // Cleanup al desmontar / cambio de reporte
    return () => {
      if (revokeRef.current && revokeRef.current.startsWith('blob:')) {
        try { URL.revokeObjectURL(revokeRef.current); } catch {}
        revokeRef.current = null;
      }
    };
  // Recalcula sólo al cambiar de reporte (o su fuente persistida)
  }, [report, persistedSrc]);

  if (!report) return null;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="justify-center flex w-full">
            <DialogTitle>{report.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!!imgSrc && (
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={imgSrc}
                alt={report.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Categoría
              </p>
              <p className="text-foreground">{CATEGORY_LABELS[report.category]}</p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
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
            <p className="text-muted-foreground">Descripción</p>
            <p className="text-foreground">{report.description}</p>
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Ubicación
            </p>
            <p className="text-foreground">{report.location.address}</p>
            <p className="text-muted-foreground">
              Coordenadas: {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Reportado por
              </p>
              <p className="text-foreground">{report.userName}</p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Fecha
              </p>
              <p className="text-foreground">{formatDate(report.createdAt)}</p>
            </div>
          </div>

          {report.updatedAt !== report.createdAt && (
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Última actualización
              </p>
              <p className="text-foreground">{formatDate(report.updatedAt)}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
