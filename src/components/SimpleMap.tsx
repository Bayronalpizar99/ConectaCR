import { useState } from 'react';
import { Report, CATEGORY_LABELS, STATUS_LABELS } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin } from 'lucide-react';

interface SimpleMapProps {
  reports: Report[];
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
  onReportClick?: (report: Report) => void;
  interactive?: boolean;
}

export default function SimpleMap({ 
  reports, 
  onLocationSelect, 
  selectedLocation,
  onReportClick,
  interactive = false 
}: SimpleMapProps) {
  const [hoveredReport, setHoveredReport] = useState<string | null>(null);

  // Map bounds for San José, Costa Rica
  const bounds = {
    minLat: 9.92,
    maxLat: 9.95,
    minLng: -84.10,
    maxLng: -84.07
  };

  const mapToPixels = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x, y };
  };

  const pixelsToCoords = (x: number, y: number) => {
    const lng = bounds.minLng + (x / 100) * (bounds.maxLng - bounds.minLng);
    const lat = bounds.maxLat - (y / 100) * (bounds.maxLat - bounds.minLat);
    return { lat, lng };
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onLocationSelect) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const { lat, lng } = pixelsToCoords(x, y);
    onLocationSelect(lat, lng);
  };

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'resuelto': return '#22c55e';
      case 'en_progreso': return '#f97316';
      default: return '#ef4444';
    }
  };

  return (
    <div className="relative w-full h-full bg-muted rounded-lg overflow-hidden">
      {/* Background map - using OpenStreetMap static tile */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://tile.openstreetmap.org/13/${-Math.floor((bounds.minLng + bounds.maxLng) / 2 * 100000)}/${Math.floor((bounds.minLat + bounds.maxLat) / 2 * 100000)}.png')`,
          filter: 'brightness(0.95) contrast(1.05)'
        }}
      />
      
      {/* Grid overlay for visual reference */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20">
        {[...Array(10)].map((_, i) => (
          <div key={`v-${i}`} className="absolute top-0 bottom-0 border-l border-foreground" style={{ left: `${i * 10}%` }} />
        ))}
        {[...Array(10)].map((_, i) => (
          <div key={`h-${i}`} className="absolute left-0 right-0 border-t border-foreground" style={{ top: `${i * 10}%` }} />
        ))}
      </div>

      {/* Interactive layer */}
      <div 
        className={`absolute inset-0 ${interactive ? 'cursor-crosshair' : ''}`}
        onClick={handleMapClick}
      >
        {/* Selected location marker */}
        {selectedLocation && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${mapToPixels(selectedLocation.lat, selectedLocation.lng).x}%`,
              top: `${mapToPixels(selectedLocation.lat, selectedLocation.lng).y}%`
            }}
          >
            <div className="relative">
              <MapPin className="w-8 h-8 text-primary drop-shadow-lg" fill="currentColor" />
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-popover px-2 py-1 rounded shadow-lg whitespace-nowrap border border-border">
                <p className="text-primary">Nueva ubicación</p>
              </div>
            </div>
          </div>
        )}

        {/* Report markers */}
        {reports.map((report) => {
          const pos = mapToPixels(report.location.lat, report.location.lng);
          const isHovered = hoveredReport === report.id;
          
          return (
            <div
              key={report.id}
              className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-all"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                zIndex: isHovered ? 50 : 10
              }}
              onMouseEnter={() => setHoveredReport(report.id)}
              onMouseLeave={() => setHoveredReport(null)}
              onClick={(e) => {
                e.stopPropagation();
                if (onReportClick) onReportClick(report);
              }}
            >
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-125"
                style={{ backgroundColor: getMarkerColor(report.status) }}
              />
              
              {isHovered && (
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-popover border border-border rounded-lg shadow-xl p-3 min-w-[200px] z-50">
                  <p className="text-popover-foreground mb-1">{report.title}</p>
                  <p className="text-muted-foreground mb-2">{CATEGORY_LABELS[report.category]}</p>
                  <Badge 
                    variant={
                      report.status === 'resuelto' ? 'default' : 
                      report.status === 'en_progreso' ? 'secondary' : 
                      'destructive'
                    }
                  >
                    {STATUS_LABELS[report.status]}
                  </Badge>
                  <p className="text-muted-foreground mt-2">{report.location.address}</p>
                  {onReportClick && (
                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReportClick(report);
                      }}
                    >
                      Ver detalles
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Map attribution */}
      <div className="absolute bottom-2 right-2 bg-popover/90 border border-border px-2 py-1 rounded text-xs text-muted-foreground">
        Mapa de San José, Costa Rica
      </div>

      {interactive && (
        <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg">
          <p>Haz clic en el mapa para seleccionar ubicación</p>
        </div>
      )}
    </div>
  );
}
