export interface CarparkRow {
  car_park_no: string;
  address: string;
  x_coord: number;
  y_coord: number;
  car_park_type: string;
  type_of_parking_system: string;
  short_term_parking: string;
  free_parking: string;
  night_parking: string;
  car_park_decks: number;
  gantry_height: number;
  car_park_basement: string;
  ev_charging: string;
}

export interface CarparkAvailabilityApiEntry {
  carpark_number: string;
  carpark_info: Array<{
    lots_available: string;
    lot_type: string;
    total_lots: string;
  }>;
  update_datetime: string;
}

export interface EnrichedCarpark {
  carpark_no: string;
  name: string;
  location: { latitude: number; longitude: number };
  available_lots: number | null;
  total_capacity: number | null;
  operating_hours: string;
  free_parking: boolean;
  free_parking_details: string;
  payment: string;
  ev_charging: boolean;
  distance: number;
  average_rating: number | null;
  total_ratings: number | null;
}
