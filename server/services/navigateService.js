const OSRM_BASE_URL = process.env.OSRM_BASE_URL || 'http://router.project-osrm.org';

/** Map OSRM maneuver types → display text + icon key. */
function getManeuver(step) {
  const type     = step.maneuver?.type     || '';
  const modifier = step.maneuver?.modifier || '';
  const name     = step.name ? `onto ${step.name}` : '';
  const dist     = step.distance > 0
    ? ` in ${step.distance >= 1000
        ? (step.distance / 1000).toFixed(1) + ' km'
        : Math.round(step.distance) + ' m'}`
    : '';

  if (type === 'depart')   return { text: `Head ${modifier || 'forward'}${name ? ' ' + name : ''}`, icon: 'straight' };
  if (type === 'arrive')   return { text: 'Arrive at destination', icon: 'arrive' };
  if (type === 'turn') {
    if (modifier.includes('left'))  return { text: `Turn left${dist}${name ? ' ' + name : ''}`,  icon: 'left'  };
    if (modifier.includes('right')) return { text: `Turn right${dist}${name ? ' ' + name : ''}`, icon: 'right' };
    if (modifier.includes('uturn')) return { text: `Make a U-turn${name ? ' ' + name : ''}`,     icon: 'uturn' };
    return { text: `Continue${name ? ' ' + name : ''}`, icon: 'straight' };
  }
  if (type === 'roundabout' || type === 'rotary') return { text: `Enter roundabout${dist}`, icon: 'right' };
  if (type === 'fork') {
    if (modifier.includes('left'))  return { text: `Keep left${name ? ' ' + name : ''}`,  icon: 'left'  };
    if (modifier.includes('right')) return { text: `Keep right${name ? ' ' + name : ''}`, icon: 'right' };
  }
  if (type === 'merge') return { text: `Merge${name ? ' ' + name : ''}`, icon: 'straight' };
  return { text: step.name ? `Continue on ${step.name}` : 'Continue straight', icon: 'straight' };
}

/** Haversine distance in metres between two [lat, lng] points. */
function getDistanceM(a, b) {
  const R  = 6371e3;
  const p1 = (a[0] * Math.PI) / 180;
  const p2 = (b[0] * Math.PI) / 180;
  const dp = ((b[0] - a[0]) * Math.PI) / 180;
  const dl = ((b[1] - a[1]) * Math.PI) / 180;
  const x  = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export class NavigateService {
  /**
   * Fetch a road-snapped driving route from OSRM.
   * start / end are both [lat, lng].
   * Returns { pts: [lat, lng][], steps, totalDist: number }
   */
  async getRoute(start, end) {
    let pts, steps;

    try {
      const url = `${OSRM_BASE_URL}/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`;
      const res  = await fetch(url);
      const data = await res.json();

      if (data.routes?.[0]) {
        pts = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);

        const rawSteps = data.routes[0].legs.flatMap((leg) => leg.steps || []);
        steps = rawSteps
          .map((s) => ({
            ...getManeuver(s),
            location: s.maneuver?.location
              ? [s.maneuver.location[1], s.maneuver.location[0]]
              : null,
          }))
          .filter((s) => s.location);
      }
    } catch (e) {
      console.warn('OSRM fetch failed, falling back to straight line:', e);
    }

    // Fallback: straight line between start and end
    if (!pts) {
      pts = Array.from({ length: 21 }, (_, i) => {
        const t = i / 20;
        return [
          start[0] + (end[0] - start[0]) * t,
          start[1] + (end[1] - start[1]) * t,
        ];
      });
      steps = [{ text: 'Head toward destination', icon: 'straight', location: pts[0] }];
    }

    const totalDist = pts.reduce(
      (sum, p, i) => (i === 0 ? 0 : sum + getDistanceM(pts[i - 1], p)),
      0,
    );

    return { pts, steps, totalDist };
  }
}