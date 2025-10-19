import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ReportCategory, CATEGORY_LABELS, Report } from '../types';
import { MapPin, Upload, X } from 'lucide-react';
import SimpleMap from './SimpleMap';

interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (report: Omit<Report, 'id' | 'userId' | 'userName' | 'createdAt' | 'updatedAt'>) => void;
}

export default function CreateReportDialog({ open, onOpenChange, onSubmit }: CreateReportDialogProps) {
  const [category, setCategory] = useState<ReportCategory>('bache');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showMap, setShowMap] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      alert('Por favor selecciona una ubicación en el mapa');
      return;
    }

    const newReport = {
      category,
      title,
      description,
      location: {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address: address || 'Dirección no especificada'
      },
      imageUrl: imageUrl || undefined,
      status: 'recibido' as const
    };

    onSubmit(newReport);
    
    // Reset form
    setCategory('bache');
    setTitle('');
    setDescription('');
    setSelectedLocation(null);
    setAddress('');
    setImageUrl('');
    setShowMap(false);
    onOpenChange(false);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    // In a real app, you would do reverse geocoding here
    setAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Reporte</DialogTitle>
          <DialogDescription>
            Completa el formulario para reportar un problema en tu comunidad
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label>Ubicación</Label>
            {!showMap ? (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setShowMap(true)}
              >
                <MapPin className="w-4 h-4 mr-2" />
                {selectedLocation ? 'Cambiar ubicación en el mapa' : 'Seleccionar ubicación en el mapa'}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="h-[300px] border rounded-lg overflow-hidden">
                  <SimpleMap 
                    reports={[]}
                    onLocationSelect={handleLocationSelect}
                    selectedLocation={selectedLocation}
                    interactive={true}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowMap(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cerrar mapa
                </Button>
              </div>
            )}
            {selectedLocation && (
              <Input 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Dirección o referencia"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">URL de Imagen (opcional)</Label>
            <div className="flex gap-2">
              <Input 
                id="image"
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Button type="button" variant="outline" size="icon">
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            {imageUrl && (
              <div className="mt-2">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Imagen+no+disponible';
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Crear Reporte
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
