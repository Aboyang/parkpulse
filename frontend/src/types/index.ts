export interface Carpark {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  available_lots: number;
  total_capacity: number;
  operating_hours: string;
  average_rating: number | null;
  total_ratings: number;
  ev_charging: boolean;
  erp_zone: boolean;
  free_parking: boolean;
  mobile_payment: boolean;
  surveillance_24_7: boolean;
  car_park_type: string;
  type_of_parking_system: string;
  short_term_parking: string;
  distance?: number;
  distanceFromCenter?: number;
  payment?: string;
  free_parking_details?: string;
}

export interface SavedCarpark {
  carparkId: string;
  carparkName: string;
  latitude: number;
  longitude: number;
  operating_hours: string;
}

export interface NavStep {
  text: string;
  icon: 'left' | 'right' | 'uturn' | 'straight';
  location?: [number, number];
}

export interface OneMapResult {
  SEARCHVAL: string;
  ADDRESS: string;
  BUILDING: string;
  LATITUDE: string;
  LONGITUDE: string;
}

export interface SearchResult {
  label: string;
  lat: number;
  lng: number;
}

export interface RatingData {
  averageRating: number;
  totalRatings: number;
}

export type RatingMap = Record<string, RatingData>;
export type AvailabilityMap = Record<string, number>;
export type LatLng = [number, number];
