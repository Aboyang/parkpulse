export function getManeuver(step) {
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

export function getDistanceM(a, b) {
  const R  = 6371e3;
  const p1 = (a[0] * Math.PI) / 180;
  const p2 = (b[0] * Math.PI) / 180;
  const dp = ((b[0] - a[0]) * Math.PI) / 180;
  const dl = ((b[1] - a[1]) * Math.PI) / 180;
  const x  = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function parseOSRMRoute(data) {
  const pts = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  const steps = data.routes[0].legs
    .flatMap((leg) => leg.steps || [])
    .map((s) => ({
      ...getManeuver(s),
      location: s.maneuver?.location
        ? [s.maneuver.location[1], s.maneuver.location[0]]
        : null,
    }))
    .filter((s) => s.location);
  return { pts, steps };
}

export function buildStraightLine(start, end) {
  const pts = Array.from({ length: 21 }, (_, i) => {
    const t = i / 20;
    return [
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t,
    ];
  });
  const steps = [{ text: 'Head toward destination', icon: 'straight', location: pts[0] }];
  return { pts, steps };
}

export function calculateTotalDistance(pts) {
  return pts.reduce(
    (sum, p, i) => (i === 0 ? 0 : sum + getDistanceM(pts[i - 1], p)),
    0,
  );
}
