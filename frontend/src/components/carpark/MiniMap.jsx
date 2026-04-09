import React from 'react';
import { useTheme } from 'next-themes';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Red pin for the searched destination
const redIcon = new L.DivIcon({
  className: '',
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 26 14 26S28 23.333 28 14C28 6.268 21.732 0 14 0z"
            fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>
  `,
  iconSize:    [28, 40],
  iconAnchor:  [14, 40],
  popupAnchor: [0, -42],
});

export default function MiniMap({ carparks, center, onMarkerClick }) {
  const { theme } = useTheme();
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-700/50 dark:border-slate-700/50 h-48">
      <MapContainer
        center={center || [1.2900, 103.8550]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url={tileUrl} />

        {/* Red destination marker */}
        {center && (
          <Marker position={center} icon={redIcon}>
            <Popup>
              <span className="font-semibold text-sm">Destination</span>
            </Popup>
          </Marker>
        )}

        {/* Carpark markers (default blue) */}
        {carparks?.map((cp) => (
          <Marker
            key={cp.id}
            position={[cp.latitude, cp.longitude]}
            eventHandlers={{ click: () => onMarkerClick?.(cp) }}
          >
            <Popup>
              <span className="font-semibold text-sm">{cp.name}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}