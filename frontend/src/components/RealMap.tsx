import { useEffect, useRef, useState } from 'react';
import { Report, CATEGORY_LABELS, STATUS_LABELS } from '../types';
import { MapPin } from 'lucide-react';

// Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

interface RealMapProps {
  reports: Report[];
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
  onReportClick?: (report: Report) => void;
  interactive?: boolean;
  userLocation?: { lat: number; lng: number } | null;

  /** 'full' (default) para mapa normal, 'thumbnail' para mini-mapa no interactivo */
  variant?: 'full' | 'thumbnail';
  /** Permite controlar tamaño desde el padre (ej. w-28 h-20) */
  className?: string;
  /** Indica si el contenedor está visible (ej. tab activo) para invalidar tamaño */
  isVisible?: boolean;
}

export default function RealMap({
  reports,
  onLocationSelect,
  selectedLocation,
  onReportClick,
  interactive = false,
  userLocation,
  variant = 'full',
  className,
  isVisible = true,
}: RealMapProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const selectedMarkerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const resizeObsRef = useRef<ResizeObserver | null>(null);
  const visibilityObsRef = useRef<IntersectionObserver | null>(null);

  // Load Leaflet CSS and JS
  useEffect(() => {
    // Add Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.async = true;
      script.onload = () => setIsLoading(false);
      script.onerror = () => {
        setLoadError(true);
        setIsLoading(false);
      };
      document.body.appendChild(script);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (isLoading || loadError || !mapContainerRef.current || !window.L) return;
    if (mapRef.current) return; // Map already initialized

    try {
      const defaultCenter: [number, number] = userLocation
        ? [userLocation.lat, userLocation.lng]
        : [9.9334, -84.0844]; // San José, CR

      const map = window.L.map(mapContainerRef.current, {
        zoomControl: variant === 'full',
      }).setView(defaultCenter, 13);


      // 🔧 Clampear z-index de los panes para que NUNCA se monten por encima del diálogo
       try {
         const panes = map.getPanes?.();
         if (panes) {
           // orden bajo y predecible
           if (panes.tilePane) panes.tilePane.style.zIndex = '0';
           if (panes.overlayPane) panes.overlayPane.style.zIndex = '1';
           if (panes.markerPane) panes.markerPane.style.zIndex = '2';
           if (panes.tooltipPane) panes.tooltipPane.style.zIndex = '3';
           if (panes.popupPane) panes.popupPane.style.zIndex = '4';
         }
         // asegúrate de que el contenedor del mapa no “pelee” el stacking
         map.getContainer().style.zIndex = '0';
         map.getContainer().style.position = 'relative';
       } catch {}


      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // thumbnail: desactivar TODA interacción
      if (variant === 'thumbnail' || !interactive) {
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
        (map.tap && map.tap.disable && map.tap.disable());
        map.getContainer().style.pointerEvents = 'none';
        map.getContainer().style.filter = 'grayscale(0.05) saturate(0.9)';
      } else if (onLocationSelect) {
        map.on('click', (e: any) => onLocationSelect(e.latlng.lat, e.latlng.lng));
      }

      mapRef.current = map;

      // Forzar cálculo de tamaño correcto (muy importante en mini-mapa / diálogos)
      requestAnimationFrame(() => map.invalidateSize({ animate: false }));

      // Recalcular cuando cambie el tamaño del contenedor
      if ('ResizeObserver' in window) {
        resizeObsRef.current = new ResizeObserver(() => map.invalidateSize({ animate: false }));
        resizeObsRef.current.observe(mapContainerRef.current);
      }

      return () => {
        resizeObsRef.current?.disconnect();
        map.remove();
        mapRef.current = null;
        visibilityObsRef.current?.disconnect();
        visibilityObsRef.current = null;
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setLoadError(true);
    }
  }, [isLoading, loadError, interactive, onLocationSelect, userLocation, variant]);

  // Recalcular tamaño cuando el contenedor vuelve a ser visible (p.ej. al cambiar de tab)
  useEffect(() => {
    if (!mapRef.current || !mapContainerRef.current || typeof IntersectionObserver === 'undefined') {
      return;
    }

    visibilityObsRef.current?.disconnect();
    visibilityObsRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => mapRef.current?.invalidateSize({ animate: false }));
        }
      });
    });

    visibilityObsRef.current.observe(mapContainerRef.current);

    return () => {
      visibilityObsRef.current?.disconnect();
      visibilityObsRef.current = null;
    };
  }, []);

  // Invalidar tamaño cuando el contenedor vuelve a ser visible (p.ej. cambio de tab)
  useEffect(() => {
    if (isVisible && mapRef.current) {
      requestAnimationFrame(() => mapRef.current?.invalidateSize({ animate: false }));
    }
  }, [isVisible]);

  // Update user location marker
  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    if (!userLocation) return;

    if (userMarkerRef.current) {
      mapRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    const userIcon = window.L.divIcon({
      className: 'custom-user-marker',
      html: `<div style="
        width: 16px;
        height: 16px;
        background-color: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const marker = window.L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon,
      title: 'Tu ubicación'
    }).addTo(mapRef.current);

    window.L.circle([userLocation.lat, userLocation.lng], {
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.1,
      radius: 100
    }).addTo(mapRef.current);

    userMarkerRef.current = marker;

    if (variant === 'full') {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 14);
    }
  }, [userLocation, variant]);

  // Update selected location marker
  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    if (selectedMarkerRef.current) {
      mapRef.current.removeLayer(selectedMarkerRef.current);
      selectedMarkerRef.current = null;
    }

    if (!selectedLocation) return;

    const selectedIcon = window.L.divIcon({
      className: 'custom-selected-marker',
      html: `<div style="position: relative; width: 32px; height: 40px;">
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24c0-8.837-7.163-16-16-16z" fill="hsl(var(--primary))" stroke="white" stroke-width="2"/>
          <circle cx="16" cy="16" r="6" fill="white"/>
        </svg>
      </div>`,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -40]
    });

    const marker = window.L.marker([selectedLocation.lat, selectedLocation.lng], {
      icon: selectedIcon
    }).addTo(mapRef.current);

    if (variant === 'full') {
      marker.bindPopup('Nueva ubicación seleccionada').openPopup();
      mapRef.current.setView([selectedLocation.lat, selectedLocation.lng], 15);
    }

    selectedMarkerRef.current = marker;
  }, [selectedLocation, variant]);

  // Update report markers
  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    markersRef.current.forEach(marker => {
      mapRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    reports.forEach((report) => {
      const getMarkerColor = (status: string) => {
        switch (status) {
          case 'resuelto': return '#22c55e';
          case 'en_progreso': return '#f97316';
          default: return '#ef4444';
        }
      };

      const color = getMarkerColor(report.status);

      const icon = window.L.divIcon({
        className: 'custom-report-marker',
        html: `<div style="
          width: 24px;
          height: 24px;
          background-color: ${color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });

      const marker = window.L.marker([report.location.lat, report.location.lng], {
        icon,
        title: report.title
      }).addTo(mapRef.current);

      if (variant === 'full') {
        const popupContent = `
          <div style="min-width: 200px; padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600;">${report.title}</h3>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${CATEGORY_LABELS[report.category]}</p>
            <div style="margin-bottom: 8px;">
              <span style="
                display: inline-block;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 12px;
                background-color: ${color};
                color: white;
              ">${STATUS_LABELS[report.status]}</span>
            </div>
            <p style="margin: 0; color: #888; font-size: 12px;">${report.location.address}</p>
          </div>
        `;
        marker.bindPopup(popupContent);
      }

      if (onReportClick && variant === 'full') {
        marker.on('click', () => onReportClick(report));
      }

      markersRef.current.push(marker);
    });

    if (reports.length > 0 && !selectedLocation && !userLocation && variant === 'full') {
      const group = window.L.featureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [reports, onReportClick, selectedLocation, userLocation, variant]);

  if (loadError) {
    return (
      <div className={`flex items-center justify-center h-full bg-muted rounded-lg ${className ?? ''}`}>
        <div className="text-center p-4">
          <p className="text-destructive mb-2">Error al cargar el mapa</p>
          <p className="text-muted-foreground">Por favor, recarga la página</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full bg-muted rounded-lg ${className ?? ''}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    );
  }

 return (
 <div className={`relative z-0 [isolation:isolate] w-full h-full ${className ?? ''}`}>
      <div ref={mapContainerRef} className="w-full h-full rounded-lg overflow-hidden" />
      {interactive && variant === 'full' && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg z-[1000] pointer-events-none">
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Haz clic en el mapa para seleccionar ubicación
          </p>
        </div>
      )}
    </div>
  );
}