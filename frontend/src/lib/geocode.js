import { NOMINATIM_BASE_URL } from './config';

// OneMap API (Singapore's official geocoder — most accurate for SG addresses)
const ONEMAP_SEARCH_URL = 'https://www.onemap.gov.sg/api/common/elastic/search';

// Fallback coordinates for common Singapore locations
const SG_KNOWN_PLACES = {
  // --- HDB Towns ---
  'ang mo kio': { lat: 1.3691, lng: 103.8454 },
  'amk': { lat: 1.3691, lng: 103.8454 },
  'bedok': { lat: 1.3236, lng: 103.9273 },
  'bishan': { lat: 1.3526, lng: 103.8352 },
  'bukit batok': { lat: 1.3491, lng: 103.7495 },
  'bukit merah': { lat: 1.2819, lng: 103.8239 },
  'bukit panjang': { lat: 1.3774, lng: 103.7719 },
  'bukit timah': { lat: 1.3294, lng: 103.8021 },
  'choa chu kang': { lat: 1.3840, lng: 103.7470 },
  'cck': { lat: 1.3840, lng: 103.7470 },
  'clementi': { lat: 1.3151, lng: 103.7650 },
  'geylang': { lat: 1.3201, lng: 103.8918 },
  'hougang': { lat: 1.3612, lng: 103.8863 },
  'jurong east': { lat: 1.3329, lng: 103.7436 },
  'jurong west': { lat: 1.3404, lng: 103.7090 },
  'jurong': { lat: 1.3329, lng: 103.7436 },
  'kallang': { lat: 1.3100, lng: 103.8720 },
  'marine parade': { lat: 1.3020, lng: 103.9070 },
  'pasir ris': { lat: 1.3721, lng: 103.9494 },
  'punggol': { lat: 1.4053, lng: 103.9022 },
  'queenstown': { lat: 1.2942, lng: 103.7861 },
  'sembawang': { lat: 1.4491, lng: 103.8185 },
  'sengkang': { lat: 1.3868, lng: 103.8914 },
  'serangoon': { lat: 1.3554, lng: 103.8679 },
  'tampines': { lat: 1.3496, lng: 103.9568 },
  'toa payoh': { lat: 1.3343, lng: 103.8563 },
  'toa payoh': { lat: 1.3343, lng: 103.8563 },
  'toapayoh': { lat: 1.3343, lng: 103.8563 },
  'woodlands': { lat: 1.4382, lng: 103.7890 },
  'yishun': { lat: 1.4304, lng: 103.8354 },

  // --- Central / Downtown ---
  'central': { lat: 1.2897, lng: 103.8501 },
  'chinatown': { lat: 1.2838, lng: 103.8440 },
  'city hall': { lat: 1.2931, lng: 103.8520 },
  'clarke quay': { lat: 1.2884, lng: 103.8465 },
  'dhoby ghaut': { lat: 1.2989, lng: 103.8457 },
  'harbourfront': { lat: 1.2654, lng: 103.8223 },
  'lavender': { lat: 1.3073, lng: 103.8630 },
  'little india': { lat: 1.3066, lng: 103.8518 },
  'marina bay': { lat: 1.2797, lng: 103.8597 },
  'marina bay sands': { lat: 1.2834, lng: 103.8607 },
  'mbs': { lat: 1.2834, lng: 103.8607 },
  'novena': { lat: 1.3204, lng: 103.8438 },
  'orchard': { lat: 1.3048, lng: 103.8318 },
  'outram': { lat: 1.2796, lng: 103.8395 },
  'peoples park': { lat: 1.2847, lng: 103.8431 },
  'raffles place': { lat: 1.2840, lng: 103.8510 },
  'raffles': { lat: 1.2840, lng: 103.8510 },
  'tanjong pagar': { lat: 1.2762, lng: 103.8455 },
  'tiong bahru': { lat: 1.2863, lng: 103.8271 },

  // --- East ---
  'changi': { lat: 1.3644, lng: 103.9915 },
  'changi airport': { lat: 1.3644, lng: 103.9915 },
  'east coast': { lat: 1.3002, lng: 103.9134 },
  'kembangan': { lat: 1.3208, lng: 103.9128 },
  'loyang': { lat: 1.3700, lng: 103.9820 },
  'paya lebar': { lat: 1.3180, lng: 103.8928 },
  'potong pasir': { lat: 1.3312, lng: 103.8687 },
  'macpherson': { lat: 1.3267, lng: 103.8887 },
  'aljunied': { lat: 1.3163, lng: 103.8828 },
  'dakota': { lat: 1.3082, lng: 103.8880 },
  'mountbatten': { lat: 1.3060, lng: 103.8814 },
  'simei': { lat: 1.3432, lng: 103.9528 },
  'tanah merah': { lat: 1.3273, lng: 103.9462 },
  'upper changi': { lat: 1.3409, lng: 103.9614 },

  // --- North ---
  'admiralty': { lat: 1.4404, lng: 103.8008 },
  'canberra': { lat: 1.4432, lng: 103.8198 },
  'khatib': { lat: 1.4172, lng: 103.8330 },
  'marsiling': { lat: 1.4328, lng: 103.7742 },
  'northpoint': { lat: 1.4296, lng: 103.8354 },
  'springleaf': { lat: 1.3991, lng: 103.8180 },
  'upper thomson': { lat: 1.3614, lng: 103.8304 },
  'yio chu kang': { lat: 1.3817, lng: 103.8449 },

  // --- North-East ---
  'compassvale': { lat: 1.3919, lng: 103.8939 },
  'fernvale': { lat: 1.3942, lng: 103.8749 },
  'kovan': { lat: 1.3602, lng: 103.8857 },
  'lorong chuan': { lat: 1.3524, lng: 103.8647 },
  'nex': { lat: 1.3527, lng: 103.8729 },
  'punggol plaza': { lat: 1.4053, lng: 103.9022 },
  'rivervale': { lat: 1.3899, lng: 103.9058 },
  'waterway': { lat: 1.4045, lng: 103.9103 },

  // --- West ---
  'boon lay': { lat: 1.3388, lng: 103.7059 },
  'buona vista': { lat: 1.3072, lng: 103.7902 },
  'chinese garden': { lat: 1.3424, lng: 103.7327 },
  'corporation': { lat: 1.3463, lng: 103.7106 },
  'dover': { lat: 1.3113, lng: 103.7785 },
  'holland village': { lat: 1.3114, lng: 103.7961 },
  'hong kah': { lat: 1.3447, lng: 103.7261 },
  'kent ridge': { lat: 1.2934, lng: 103.7847 },
  'lakeside': { lat: 1.3441, lng: 103.7209 },
  'one-north': { lat: 1.2994, lng: 103.7873 },
  'pioneer': { lat: 1.3380, lng: 103.6971 },
  'tengah': { lat: 1.3741, lng: 103.7394 },
  'tuas': { lat: 1.3200, lng: 103.6368 },
  'west coast': { lat: 1.3015, lng: 103.7626 },

  // --- Shopping Malls ---
  'ion orchard': { lat: 1.3040, lng: 103.8318 },
  'vivocity': { lat: 1.2643, lng: 103.8222 },
  'jewel changi': { lat: 1.3601, lng: 103.9891 },
  'jewel': { lat: 1.3601, lng: 103.9891 },
  'bugis junction': { lat: 1.2993, lng: 103.8551 },
  'bugis': { lat: 1.2993, lng: 103.8551 },
  'plaza singapura': { lat: 1.3006, lng: 103.8457 },
  'suntec': { lat: 1.2938, lng: 103.8578 },
  'suntec city': { lat: 1.2938, lng: 103.8578 },
  'junction 8': { lat: 1.3503, lng: 103.8329 },
  'causeway point': { lat: 1.4362, lng: 103.7862 },
  'northpoint city': { lat: 1.4296, lng: 103.8354 },
  'tampines mall': { lat: 1.3527, lng: 103.9451 },
  'century square': { lat: 1.3457, lng: 103.9528 },
  'white sands': { lat: 1.3742, lng: 103.9500 },
  'compass one': { lat: 1.3920, lng: 103.8950 },
  'compass rose': { lat: 1.3920, lng: 103.8950 },
  'waterway point': { lat: 1.4055, lng: 103.9022 },
  'bedok mall': { lat: 1.3241, lng: 103.9300 },
  'amk hub': { lat: 1.3700, lng: 103.8455 },
  'imm': { lat: 1.3344, lng: 103.7479 },
  'westgate': { lat: 1.3340, lng: 103.7422 },
  'jem': { lat: 1.3333, lng: 103.7433 },
  'lot one': { lat: 1.3853, lng: 103.7451 },
  'bukit panjang plaza': { lat: 1.3783, lng: 103.7620 },
  'hillion mall': { lat: 1.3783, lng: 103.7620 },

  // --- Universities / Hospitals / Key Landmarks ---
  'nus': { lat: 1.2966, lng: 103.7764 },
  'ntu': { lat: 1.3483, lng: 103.6831 },
  'smu': { lat: 1.2979, lng: 103.8494 },
  'sutd': { lat: 1.3413, lng: 103.9630 },
  'singapore general hospital': { lat: 1.2796, lng: 103.8355 },
  'sgh': { lat: 1.2796, lng: 103.8355 },
  'tan tock seng': { lat: 1.3213, lng: 103.8455 },
  'tts': { lat: 1.3213, lng: 103.8455 },
  'ktph': { lat: 1.4247, lng: 103.8354 },
  'ng teng fong': { lat: 1.3334, lng: 103.7451 },
  'changi general hospital': { lat: 1.3408, lng: 103.9487 },
  'cgh': { lat: 1.3408, lng: 103.9487 },
  'national stadium': { lat: 1.3041, lng: 103.8745 },
  'sports hub': { lat: 1.3041, lng: 103.8745 },
  'gardens by the bay': { lat: 1.2816, lng: 103.8636 },
  'sentosa': { lat: 1.2494, lng: 103.8303 },
  'resorts world sentosa': { lat: 1.2540, lng: 103.8238 },
  'rws': { lat: 1.2540, lng: 103.8238 },
  'universal studios': { lat: 1.2540, lng: 103.8238 },
};

// All MRT/LRT stations in Singapore with coordinates
const MRT_STATIONS = {
  'admiralty': { lat: 1.4404, lng: 103.8008 },
  'aljunied': { lat: 1.3163, lng: 103.8828 },
  'ang mo kio': { lat: 1.3700, lng: 103.8495 },
  'bartley': { lat: 1.3426, lng: 103.8799 },
  'bayfront': { lat: 1.2821, lng: 103.8587 },
  'beauty world': { lat: 1.3412, lng: 103.7759 },
  'bedok': { lat: 1.3240, lng: 103.9300 },
  'bedok north': { lat: 1.3352, lng: 103.9196 },
  'bedok reservoir': { lat: 1.3328, lng: 103.9322 },
  'bishan': { lat: 1.3511, lng: 103.8484 },
  'boon keng': { lat: 1.3197, lng: 103.8619 },
  'boon lay': { lat: 1.3388, lng: 103.7059 },
  'botanic gardens': { lat: 1.3224, lng: 103.8154 },
  'braddell': { lat: 1.3404, lng: 103.8470 },
  'bras basah': { lat: 1.2967, lng: 103.8503 },
  'bt batok': { lat: 1.3491, lng: 103.7495 },
  'bukit batok': { lat: 1.3491, lng: 103.7495 },
  'bukit gombak': { lat: 1.3589, lng: 103.7516 },
  'bukit panjang': { lat: 1.3784, lng: 103.7762 },
  'buona vista': { lat: 1.3072, lng: 103.7902 },
  'caldecott': { lat: 1.3374, lng: 103.8393 },
  'canberra': { lat: 1.4432, lng: 103.8198 },
  'cashew': { lat: 1.3692, lng: 103.7648 },
  'changi airport': { lat: 1.3573, lng: 103.9883 },
  'chinatown': { lat: 1.2838, lng: 103.8440 },
  'chinese garden': { lat: 1.3424, lng: 103.7327 },
  'choa chu kang': { lat: 1.3853, lng: 103.7446 },
  'city hall': { lat: 1.2931, lng: 103.8520 },
  'clarke quay': { lat: 1.2884, lng: 103.8465 },
  'clementi': { lat: 1.3151, lng: 103.7650 },
  'commonwealth': { lat: 1.3025, lng: 103.7984 },
  'coral edge': { lat: 1.3913, lng: 103.9118 },
  'cove': { lat: 1.3968, lng: 103.9058 },
  'dakota': { lat: 1.3082, lng: 103.8880 },
  'damai': { lat: 1.3398, lng: 103.9476 },
  'dhoby ghaut': { lat: 1.2989, lng: 103.8457 },
  'dover': { lat: 1.3113, lng: 103.7785 },
  'downtown': { lat: 1.2793, lng: 103.8527 },
  'esplanade': { lat: 1.2934, lng: 103.8556 },
  'eunos': { lat: 1.3196, lng: 103.9030 },
  'expo': { lat: 1.3354, lng: 103.9615 },
  'farrer park': { lat: 1.3122, lng: 103.8546 },
  'farrer road': { lat: 1.3172, lng: 103.8079 },
  'fernvale': { lat: 1.3942, lng: 103.8749 },
  'flora': { lat: 1.3638, lng: 103.9575 },
  'geylang bahru': { lat: 1.3213, lng: 103.8717 },
  'harbourfront': { lat: 1.2654, lng: 103.8223 },
  'haw par villa': { lat: 1.2826, lng: 103.7828 },
  'hillview': { lat: 1.3624, lng: 103.7674 },
  'holland village': { lat: 1.3114, lng: 103.7961 },
  'hougang': { lat: 1.3712, lng: 103.8926 },
  'hume': { lat: 1.3514, lng: 103.7660 },
  'jurong east': { lat: 1.3329, lng: 103.7436 },
  'kaki bukit': { lat: 1.3350, lng: 103.9085 },
  'kallang': { lat: 1.3121, lng: 103.8719 },
  'katib': { lat: 1.4172, lng: 103.8330 },
  'khatib': { lat: 1.4172, lng: 103.8330 },
  'kent ridge': { lat: 1.2934, lng: 103.7847 },
  'kembangan': { lat: 1.3208, lng: 103.9128 },
  'king albert park': { lat: 1.3355, lng: 103.7832 },
  'kovan': { lat: 1.3602, lng: 103.8857 },
  'kranji': { lat: 1.4254, lng: 103.7619 },
  'lakeside': { lat: 1.3441, lng: 103.7209 },
  'lavender': { lat: 1.3073, lng: 103.8630 },
  'lentor': { lat: 1.3992, lng: 103.8365 },
  'little india': { lat: 1.3066, lng: 103.8518 },
  'lorong chuan': { lat: 1.3524, lng: 103.8647 },
  'macpherson': { lat: 1.3267, lng: 103.8887 },
  'marina bay': { lat: 1.2764, lng: 103.8546 },
  'marina south pier': { lat: 1.2710, lng: 103.8634 },
  'marsiling': { lat: 1.4328, lng: 103.7742 },
  'marymount': { lat: 1.3494, lng: 103.8394 },
  'mattar': { lat: 1.3263, lng: 103.8838 },
  'mayflower': { lat: 1.3722, lng: 103.8387 },
  'mountbatten': { lat: 1.3060, lng: 103.8814 },
  'mrt': { lat: 1.2931, lng: 103.8520 },
  'newton': { lat: 1.3121, lng: 103.8381 },
  'nice view': { lat: 1.3919, lng: 103.8939 },
  'nicoll highway': { lat: 1.2998, lng: 103.8639 },
  'novena': { lat: 1.3204, lng: 103.8438 },
  'one-north': { lat: 1.2994, lng: 103.7873 },
  'orchard': { lat: 1.3040, lng: 103.8318 },
  'outram park': { lat: 1.2796, lng: 103.8395 },
  'pasir panjang': { lat: 1.2762, lng: 103.7916 },
  'pasir ris': { lat: 1.3721, lng: 103.9494 },
  'paya lebar': { lat: 1.3180, lng: 103.8928 },
  'pioneer': { lat: 1.3380, lng: 103.6971 },
  'potong pasir': { lat: 1.3312, lng: 103.8687 },
  'promenade': { lat: 1.2934, lng: 103.8608 },
  'punggol': { lat: 1.4053, lng: 103.9022 },
  'queenstown': { lat: 1.2942, lng: 103.7861 },
  'raffles place': { lat: 1.2840, lng: 103.8510 },
  'redhill': { lat: 1.2897, lng: 103.8168 },
  'riviera': { lat: 1.3969, lng: 103.9030 },
  'rochor': { lat: 1.3042, lng: 103.8524 },
  'sembawang': { lat: 1.4491, lng: 103.8185 },
  'sengkang': { lat: 1.3918, lng: 103.8951 },
  'serangoon': { lat: 1.3499, lng: 103.8731 },
  'simei': { lat: 1.3432, lng: 103.9528 },
  'sixth avenue': { lat: 1.3306, lng: 103.7970 },
  'somerset': { lat: 1.3006, lng: 103.8389 },
  'stadium': { lat: 1.3026, lng: 103.8752 },
  'stevens': { lat: 1.3199, lng: 103.8259 },
  'stirling': { lat: 1.2897, lng: 103.8168 },
  'tai seng': { lat: 1.3354, lng: 103.8880 },
  'tampines': { lat: 1.3527, lng: 103.9451 },
  'tampines east': { lat: 1.3563, lng: 103.9603 },
  'tampines west': { lat: 1.3463, lng: 103.9383 },
  'tanah merah': { lat: 1.3273, lng: 103.9462 },
  'tanjong pagar': { lat: 1.2762, lng: 103.8455 },
  'telok ayer': { lat: 1.2822, lng: 103.8482 },
  'telok blangah': { lat: 1.2708, lng: 103.8095 },
  'tiong bahru': { lat: 1.2863, lng: 103.8271 },
  'toa payoh': { lat: 1.3343, lng: 103.8563 },
  'too payoh': { lat: 1.3343, lng: 103.8563 },
  'upper changi': { lat: 1.3409, lng: 103.9614 },
  'woodlands': { lat: 1.4382, lng: 103.7890 },
  'woodlands north': { lat: 1.4482, lng: 103.7869 },
  'woodlands south': { lat: 1.4266, lng: 103.7865 },
  'woodleigh': { lat: 1.3394, lng: 103.8706 },
  'yew tee': { lat: 1.3969, lng: 103.7472 },
  'yio chu kang': { lat: 1.3817, lng: 103.8449 },
  'yishun': { lat: 1.4304, lng: 103.8354 },
};

/**
 * Find the closest MRT station to a given query using simple string similarity.
 * Returns coords of the best-matching station, or null if no reasonable match.
 */
function findClosestMRT(query) {
  const key = query.trim().toLowerCase();
  let bestScore = 0;
  let bestCoords = null;

  for (const [station, coords] of Object.entries(MRT_STATIONS)) {
    // Check if query contains the station name or vice versa
    if (station.includes(key) || key.includes(station)) {
      const score = Math.max(station.length, key.length) === 0
        ? 0
        : Math.min(station.length, key.length) / Math.max(station.length, key.length);
      if (score > bestScore) {
        bestScore = score;
        bestCoords = coords;
      }
    }
  }

  // Only return if there's a reasonable overlap (>30% match)
  return bestScore > 0.3 ? bestCoords : null;
}

/**
 * Geocode a search string to lat/lng.
 * First tries the built-in known places list, then falls back to Nominatim.
 */
export async function geocode(query) {
  const key = query.trim().toLowerCase();
  const trimmed = query.trim();

  // Try OneMap first — most accurate for Singapore addresses, postal codes, building names
  try {
    const url = `${ONEMAP_SEARCH_URL}?searchVal=${encodeURIComponent(trimmed)}&returnGeom=Y&getAddrDetails=N&pageNum=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data?.results?.length > 0) {
      const r = data.results[0];
      return { lat: parseFloat(r.LATITUDE), lng: parseFloat(r.LONGITUDE) };
    }
  } catch (_) {}

  // Fall back to Nominatim
  try {
    const q = encodeURIComponent(`${trimmed}, Singapore`);
    const url = `${NOMINATIM_BASE_URL}/search?q=${q}&format=json&limit=1&countrycodes=sg`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'ParkPulse-App/1.0' },
    });
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (_) {}

  // Check known places list (exact match only)
  if (SG_KNOWN_PLACES[key]) return SG_KNOWN_PLACES[key];

  // Last resort: find the closest MRT station by name similarity
  const mrtMatch = findClosestMRT(query);
  if (mrtMatch) return mrtMatch;

  return null;
}

/**
 * Reverse geocode a lat/lng to a human-readable address string using OneMap.
 */
export async function reverseGeocode(lat, lng) {
  try {
    const url = `https://www.onemap.gov.sg/api/public/revgeocode?location=${lat},${lng}&buffer=40&addressType=All&otherFeatures=N`;
    const res = await fetch(url);
    const data = await res.json();
    if (data?.GeocodeInfo?.length > 0) {
      const info = data.GeocodeInfo[0];
      // Build a clean label: BLOCK + ROAD or just BUILDINGNAME
      const parts = [info.BUILDINGNAME, info.BLOCK && info.ROAD ? `${info.BLOCK} ${info.ROAD}` : info.ROAD].filter(Boolean);
      if (parts.length) return parts[0];
    }
  } catch (_) {}
  // Fallback to Nominatim
  try {
    const res = await fetch(`${NOMINATIM_BASE_URL}/reverse?lat=${lat}&lon=${lng}&format=json`, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'ParkPulse-App/1.0' },
    });
    const data = await res.json();
    if (data?.address) {
      const a = data.address;
      return a.road || a.suburb || a.neighbourhood || a.city || 'Current Location';
    }
  } catch (_) {}
  return 'Current Location';
}

/**
 * Get the user's current GPS position.
 * Returns { lat, lng } or null if denied / unavailable.
 */
export function getCurrentPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
}
