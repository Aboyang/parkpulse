import type { OSRMStep, OSRMResponse, ParsedRoute, RouteStep } from "../types/navigate.js";

export function getManeuver(step: OSRMStep): { text: string; icon: string } {
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
  return { text: step.name ? `Continue on ${step.name}` : 'Continue straight', icon: 'straight' };
}

export function getDistanceM(a: [number, number], b: [number, number]): number {
  const R  = 6371e3;
  const p1 = (a[0] * Math.PI) / 180;
  const p2 = (b[0] * Math.PI) / 180;
  const dp = ((b[0] - a[0]) * Math.PI) / 180;
  const dl = ((b[1] - a[1]) * Math.PI) / 180;
  const x  = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function parseOSRMRoute(data: OSRMResponse): ParsedRoute {
  const route = data.routes[0];
  if (!route) throw new Error("No route returned from OSRM");
  const pts = route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
  const steps: RouteStep[] = route.legs
    .flatMap((leg) => leg.steps || [])
    .map((s) => ({
      ...getManeuver(s),
      location: s.maneuver?.location
        ? [s.maneuver.location[1], s.maneuver.location[0]] as [number, number]
        : null,
    }))
    .filter((s): s is RouteStep & { location: [number, number] } => s.location !== null);
  return { pts, steps };
}

export function buildStraightLine(start: [number, number], end: [number, number]): ParsedRoute {
  const pts: [number, number][] = Array.from({ length: 21 }, (_, i) => {
    const t = i / 20;
    return [
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t,
    ];
  });
  const steps: RouteStep[] = [{ text: 'Head toward destination', icon: 'straight', location: start }];
  return { pts, steps };
}

export function calculateTotalDistance(pts: [number, number][]): number {
  return pts.reduce(
    (sum, p, i) => (i === 0 ? 0 : sum + getDistanceM(pts[i - 1]!, p)),
    0,
  );
}
