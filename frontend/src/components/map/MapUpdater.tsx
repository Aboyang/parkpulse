import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { LatLng } from '@/types';

interface MapUpdaterProps {
  center: LatLng;
}

export function MapUpdater({ center }: MapUpdaterProps) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom(), { animate: true, duration: 0.5 });
  }, [center?.[0], center?.[1]]);
  return null;
}
