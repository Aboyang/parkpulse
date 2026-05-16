import {
  parseOSRMRoute,
  buildStraightLine,
  calculateTotalDistance,
} from "../helpers/navigateHelper.js";

const OSRM_BASE_URL = process.env.OSRM_BASE_URL || 'http://router.project-osrm.org';

export class NavigateService {
  async getRoute(start, end) {
    let routePoints, steps;

    try {
      const [startLat, startLon] = start;
      const [endLat, endLon] = end;
      const url = `${OSRM_BASE_URL}/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson&steps=true`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes?.[0]) {
        ({ pts: routePoints, steps } = parseOSRMRoute(data));
      }
    } catch (error) {
      console.warn('OSRM fetch failed, falling back to straight line:', error);
    }

    if (!routePoints) {
      ({ pts: routePoints, steps } = buildStraightLine(start, end));
    }

    const totalDistance = calculateTotalDistance(routePoints);
    return { pts: routePoints, steps, totalDist: totalDistance };
  }
}
