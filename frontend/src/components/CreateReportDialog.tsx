import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ReportCategory, CATEGORY_LABELS, Report } from '../types';
import MiniMap from './MiniMap';
import { useGeolocation } from '../hooks/useGeolocation';
import 'leaflet/dist/leaflet.css';

interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (report: Omit<Report, 'id' | 'userId' | 'userName' | 'createdAt' | 'updatedAt'>) => void;
}


// helper: File -> dataURL (para persistir tras refresh)
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

export default function CreateReportDialog({ open, onOpenChange, onSubmit }: CreateReportDialogProps) {
  const [category, setCategory] = useState<ReportCategory>('bache');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Geolocalización del usuario (solo para centrar el minimapa y setear selectedLocation al abrir)
  const geolocation = useGeolocation();
  const userLocation = geolocation.latitude && geolocation.longitude
    ? { lat: geolocation.latitude, lng: geolocation.longitude }
    : null;


  // NUEVO: ref al input file
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Abrir selector de archivos al hacer click en el botón
  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  // Cuando el usuario elige una imagen
  const handleImageChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación simple (opcional)
    if (!file.type.startsWith('image/')) {
      alert('Selecciona un archivo de imagen válido.');
      return;
    }

    // Limpiar URL previa para evitar memory leaks
    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Limpiar la ObjectURL al desmontar
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);


  const [isPicking, setIsPicking] = useState(false);

  const handlePick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
    setIsPicking(false);
  };

  // Al abrir, si hay geolocalización, fijamos esa ubicación y una dirección básica
  useEffect(() => {
    if (open && userLocation && !selectedLocation) {
      setSelectedLocation(userLocation);
      setAddress(`Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}`);
    }
  }, [open, userLocation, selectedLocation]);




useEffect(() => {
  if (open) {
    const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 120);
    return () => clearTimeout(t);
  }
}, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLocation) {
      alert('No se pudo obtener tu ubicación. Activa la geolocalización para continuar.');
      return;
    }

  // Generar dataURL si hay archivo (para persistencia tras refresh)
      let imageDataUrl: string | undefined;
      if (imageFile) {
        try {
          imageDataUrl = await fileToDataUrl(imageFile);
        } catch {
          imageDataUrl = undefined;
        }
      }

    const newReport = {
      category,
      title,
      description,
      location: {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address: address || 'Dirección no especificada',
      },
      imageFile: imageFile || undefined,
      imageDataUrl: imageDataUrl || undefined,
      status: 'recibido' as const,
    };

    onSubmit(newReport);

    // Reset form
    setCategory('bache');
    setTitle('');
    setDescription('');
    setSelectedLocation(null);
    setAddress('');
    setImageFile(null);
    setImagePreview(null);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Reporte</DialogTitle>
            <DialogDescription>
              Completa el formulario para reportar un problema en tu comunidad
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoría del Problema</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as ReportCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Resumen breve del problema"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe el problema en detalle..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
                <Label>Ubicación del Problema</Label>

                {/* Minimapa */}
                <div className="h-48 select-none relative border rounded-lg overflow-hidden">
                  {/* Tip cuando está en modo selección */}
                  {isPicking && (
                    <div className="absolute left-2 top-2 z-10 bg-background/90 backdrop-blur px-2 py-1 rounded text-xs border shadow pointer-events-none">
                      Haz clic en el mapa para elegir la ubicación
                    </div>
                  )}

                  <MiniMap
                    selectedLocation={selectedLocation || userLocation || undefined}
                    userLocation={userLocation || undefined}
                    enablePick={isPicking}
                    onLocationPick={handlePick}
                  />
                </div>

                {/* Botón para activar/cancelar selección */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={isPicking ? "secondary" : "outline"}
                    onClick={() => setIsPicking((v) => !v)}
                    className="flex-1"
                  >
                    {isPicking ? "Cancelar" : "Seleccionar ubicación en el mapa"}
                  </Button>
                </div>
              </div>


            {/* Foto (subir y previsualizar) */}
              <div className="space-y-2">
                <Label>Foto (opcional)</Label>

                {/* Botón que abre el selector */}
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-label='Seleccionar imagen'
                    onChange={handleImageChange}
                  />
                  <Button type="button" variant="outline" onClick={handlePickImage} className="flex-1">
                    Subir foto
                  </Button>
                </div>

                {/* Preview debajo del botón */}
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt={imageFile?.name || 'Imagen seleccionada'}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>


            {/* Acciones */}
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={!selectedLocation}>
                Crear Reporte
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
