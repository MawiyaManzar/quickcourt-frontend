import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface VenueMapProps {
  latitude: number;
  longitude: number;
  venueName: string;
  address: string;
}

export default function VenueMap({ latitude, longitude, venueName, address }: VenueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: 15,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Custom Icon
    const customIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div style="background:#16a34a; width:32px; height:32px; border-radius:50%; border:3px solid #ffffff; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.4); font-size:16px;">🏟️</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Add marker and popup
    const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
    marker.bindPopup(`
      <div style="font-family:Inter, sans-serif; padding:4px;">
        <strong style="color:#0f172a; font-size:14px;">${venueName}</strong><br/>
        <span style="color:#64748b; font-size:12px;">${address}</span>
      </div>
    `).openPopup();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, venueName, address]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height: '320px',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        zIndex: 1,
      }}
    />
  );
}
