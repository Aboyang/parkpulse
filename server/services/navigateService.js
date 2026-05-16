import {
  parseOSRMRoute,
  buildStraightLine,
  calculateTotalDistance,
} from "../helpers/navigateHelper.js";

const OSRM_BASE_URL = process.env.OSRM_BASE_URL || 'http://router.project-osrm.org';

export class NavigateService {
  async getRoute(start, end) {
    let pts, steps;

    try {
      const url = `${OSRM_BASE_URL}/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`;
      const res  = await fetch(url);
      const data = await res.json();

      if (data.routes?.[0]) {
        ({ pts, steps } = parseOSRMRoute(data));
      }
    } catch (e) {
      console.warn('OSRM fetch failed, falling back to straight line:', e);
    }

    if (!pts) {
      ({ pts, steps } = buildStraightLine(start, end));
    }

    const totalDist = calculateTotalDistance(pts);
    return { pts, steps, totalDist };
  }
}
