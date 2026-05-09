import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  className?: string;
}

const defaultCenter = { lat: 14.5995, lng: 120.9842 };

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number, address?: string) => void }) {
  useMapEvents({
    click: async (event) => {
      const lat = event.latlng.lat;
      const lng = event.latlng.lng;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        const address = data.display_name || undefined;
        onLocationSelect(lat, lng, address);
      } catch (error) {
        console.error('Reverse geocoding failed:', error);
        onLocationSelect(lat, lng);
      }
    },
  });

  return null;
}

export function LocationMap({ latitude, longitude, onLocationSelect, className = '' }: LocationMapProps) {
  const center = useMemo(
    () => ({ lat: latitude ?? defaultCenter.lat, lng: longitude ?? defaultCenter.lng }),
    [latitude, longitude]
  );

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '300px' }}
        key={`${center.lat}-${center.lng}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationSelect={onLocationSelect} />
        {latitude !== null && longitude !== null && (
          <Marker position={[latitude, longitude]} icon={markerIcon} />
        )}
      </MapContainer>
      <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded shadow text-xs text-gray-600">
        Click on the map to select location
      </div>
    </div>
  );
}
