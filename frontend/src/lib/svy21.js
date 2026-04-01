/**
 * Convert SVY21 (Singapore projection) coordinates to WGS84 (lat/lng).
 * Reference: https://github.com/cgcai/SVY21
 */

const a = 6378137;
const f = 1 / 298.257223563;
const b = a * (1 - f);
const e2 = 1 - (b * b) / (a * a);
const e4 = e2 * e2;
const e6 = e4 * e2;

const A0 = 1 - e2 / 4 - 3 * e4 / 64 - 5 * e6 / 256;
const A2 = 3 / 8 * (e2 + e4 / 4 + 15 * e6 / 128);
const A4 = 15 / 256 * (e4 + 3 * e6 / 4);
const A6 = 35 * e6 / 3072;

// SVY21 origin
const oLat = 1.366666;
const oLon = 103.833333;
const oN = 38744.572;
const oE = 28001.642;
const k = 1;

function calcM(lat) {
  const latR = (lat * Math.PI) / 180;
  return a * (A0 * latR - A2 * Math.sin(2 * latR) + A4 * Math.sin(4 * latR) - A6 * Math.sin(6 * latR));
}

export function svy21ToWGS84(N, E) {
  const Nprime = N - oN;
  const Mo = calcM(oLat);

  let M = Mo + Nprime / k;
  const sigma = M / (a * A0);

  const latPrime =
    sigma +
    (3 * (e2 / 4 + 9 * e4 / 64) * Math.sin(2 * sigma)) / 2 -
    (15 * (e4 / 16 + 3 * e6 / 32) * Math.sin(4 * sigma)) / 16 +
    (35 * (e6 / 48) * Math.sin(6 * sigma)) / 48;

  const sinLatPrime = Math.sin(latPrime);
  const cosLatPrime = Math.cos(latPrime);
  const tanLatPrime = Math.tan(latPrime);

  const rho = (a * (1 - e2)) / Math.pow(1 - e2 * sinLatPrime * sinLatPrime, 1.5);
  const v = a / Math.pow(1 - e2 * sinLatPrime * sinLatPrime, 0.5);

  const psi = v / rho;
  const t = tanLatPrime;
  const Eprime = (E - oE) / k;
  const X = Eprime / v;

  const lat =
    latPrime -
    ((t / (k * rho)) * (X * Eprime)) / 2 +
    ((t / (k * rho)) *
      (X * Eprime * Eprime * Eprime) *
      (-(4 * psi * psi + 9 * psi * (1 - t * t) + 12 * t * t))) /
      24 -
    ((t / (k * rho)) *
      Math.pow(X * Eprime, 5) *
      (1 + 24 * t * t)) /
      720;

  const lon =
    (oLon * Math.PI) / 180 +
    X / cosLatPrime -
    (X * X * X * (psi + 2 * t * t)) / (6 * cosLatPrime) +
    (X * X * X * X * X * (-(2 * psi * psi + 5 * psi * (1 - 2 * t * t) + 28 * t * t))) /
      (120 * cosLatPrime);

  return {
    lat: (lat * 180) / Math.PI,
    lng: (lon * 180) / Math.PI,
  };
}
