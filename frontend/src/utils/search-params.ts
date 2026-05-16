import type { SearchResult } from '@/types';

export function buildResultsParams({ destination, coords, evCharging, radius }: {
  destination: string;
  coords: SearchResult | null;
  evCharging: boolean;
  radius: number;
}) {
  return new URLSearchParams({
    q:      destination.trim(),
    ev:     String(evCharging),
    radius: String(radius),
    t:      String(Date.now()),
    ...(coords ? { lat: String(coords.lat), lng: String(coords.lng) } : {}),
  });
}
