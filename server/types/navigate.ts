export interface OSRMManeuver {
  type: string;
  modifier: string;
  location: [number, number];
}

export interface OSRMStep {
  name: string;
  distance: number;
  maneuver?: OSRMManeuver;
}

export interface OSRMLeg {
  steps: OSRMStep[];
}

export interface OSRMRoute {
  geometry: { coordinates: [number, number][] };
  legs: OSRMLeg[];
}

export interface OSRMResponse {
  routes: OSRMRoute[];
}

export interface RouteStep {
  text: string;
  icon: string;
  location: [number, number] | null;
}

export interface ParsedRoute {
  pts: [number, number][];
  steps: RouteStep[];
}
