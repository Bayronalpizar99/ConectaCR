import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type LatLng = { lat: number; lng: number };
interface MiniMapProps {
  selectedLocation?: LatLng | null;
  userLocation?: LatLng | null;
  enablePick?: boolean;
  onLocationPick?: (lat: number, lng: number) => void;
}

export default function MiniMap({ selectedLocation, userLocation, enablePick, onLocationPick }: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const selMarkerRef = useRef<L.Marker | null>(null);
  const zoomCtrlRef = useRef<L.Control.Zoom | null>(null);

  const center = useMemo<LatLng>(() => {
    return selectedLocation ?? userLocation ?? { lat: 9.9334, lng: -84.0844 };
  }, [selectedLocation, userLocation]);

  // Crear mapa una sola vez (por defecto sin interacción)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,          // lo añadimos/quitamos manualmente
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    mapRef.current = map;

    // preparar control de zoom para activarlo cuando enablePick = true
    zoomCtrlRef.current = L.control.zoom({ position: 'topright' });

    const invalidate = () => map.invalidateSize();
    setTimeout(invalidate, 0);
    const ro = new ResizeObserver(invalidate);
    ro.observe(containerRef.current);
    window.addEventListener('resize', invalidate);

    return () => {
      window.removeEventListener('resize', invalidate);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
      selMarkerRef.current = null;
      zoomCtrlRef.current = null;
    };
  }, []);

  // Centrar
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([center.lat, center.lng], 15, { animate: false });
    setTimeout(() => map.invalidateSize(), 0);
  }, [center]);

  // Marker usuario
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    if (!userLocation) return;

    const icon = L.divIcon({
      className: 'custom-user-marker',
      html: `<div style="width:12px;height:12px;background:#3b82f6;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,.3)"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });
    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon }).addTo(map);
  }, [userLocation]);

  // Marker seleccionado
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selMarkerRef.current) {
      map.removeLayer(selMarkerRef.current);
      selMarkerRef.current = null;
    }
    const target = selectedLocation ?? userLocation;
    if (!target) return;

    const icon = L.divIcon({
      className: 'custom-selected-marker',
      html: `<svg width="24" height="30" viewBox="0 0 24 30" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.372 0 0 5.372 0 12c0 8.25 12 18 12 18s12-9.75 12-18C24 5.372 18.628 0 12 0z" fill="hsl(var(--primary))" stroke="white" stroke-width="1.5"/>
        <circle cx="12" cy="12" r="4" fill="white"/>
      </svg>`,
      iconSize: [24, 30],
      iconAnchor: [12, 30],
    });
    selMarkerRef.current = L.marker([target.lat, target.lng], { icon }).addTo(map);
  }, [selectedLocation, userLocation]);

  // ⬇️ Toggle de interacciones + click-to-pick
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // handler de click
    const handleClick = (e: L.LeafletMouseEvent) => {
      if (!enablePick || !onLocationPick) return;
      onLocationPick(e.latlng.lat, e.latlng.lng);
    };

    // aplicar modo interactivo según enablePick
    const setInteractive = (on: boolean) => {
      if (on) {
        map.dragging.enable();
        map.touchZoom.enable();
        map.scrollWheelZoom.enable();
        map.doubleClickZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
        if (zoomCtrlRef.current) zoomCtrlRef.current.addTo(map);
        if (containerRef.current) containerRef.current.style.cursor = 'crosshair';
        map.on('click', handleClick);
      } else {
        map.off('click', handleClick);
        map.dragging.disable();
        map.touchZoom.disable();
        map.scrollWheelZoom.disable();
        map.doubleClickZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
        if (zoomCtrlRef.current) zoomCtrlRef.current.remove();
        if (containerRef.current) containerRef.current.style.cursor = '';
      }
    };

    setInteractive(!!enablePick);
    return () => {
      // limpiar por si desmonta mientras estaba activo
      map.off('click', handleClick);
    };
  }, [enablePick, onLocationPick]);

  return <div ref={containerRef} className="w-full h-full" />;
}
