/**
 * Multi-source carpark service for Singapore.
 *
 * Sources:
 *   1. HDB carpark info (all 2263 records via pagination) + live availability
 *   2. OneMap search API — "carpark" near the query location (all pages)
 *
 * All sources are fetched in parallel, merged, deduplicated,
 * and returned as a flat normalised array. Spatial filtering by
 * radius is done in the Results page.
 */
import { svy21ToWGS84 } from './svy21';
import { CARPARK_AVAILABILITY_URL } from './config';

const ONEMAP_SEARCH = 'https://www.onemap.gov.sg/api/common/elastic/search';
const HDB_INFO_BASE = 'https://data.gov.sg/api/action/datastore_search?resource_id=d_23f946fa557947f93a8043bbef41dd09';
const HDB_PAGE_SIZE = 500;

// ─── helpers ─────────────────────────────────────────────────────────────────

export function distMetres(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function inSingapore(lat, lng) {
  return lat > 1.1 && lat < 1.55 && lng > 103.5 && lng < 104.1;
}

// ─── Source 1: HDB (CSV download via api-open.data.gov.sg, + live availability) ──

let _hdbCache = null;
let _hdbCacheTime = 0;

async function fetchAllHDBInfo() {
  const firstRes = await fetch(`${HDB_INFO_BASE}&limit=${HDB_PAGE_SIZE}&offset=0`);
  const firstJson = await firstRes.json();
  const total = firstJson?.result?.total || 0;
  let records = firstJson?.result?.records || [];

  if (total > HDB_PAGE_SIZE) {
    const offsets = [];
    for (let offset = HDB_PAGE_SIZE; offset < total; offset += HDB_PAGE_SIZE) offsets.push(offset);
    const pages = await Promise.all(
      offsets.map((offset) =>
        fetch(`${HDB_INFO_BASE}&limit=${HDB_PAGE_SIZE}&offset=${offset}`)
          .then((r) => r.json())
          .then((j) => j?.result?.records || [])
      )
    );
    records = records.concat(...pages);
  }

  console.log(`[carparkService] HDB info records fetched: ${records.length} / ${total}`);
  return records;
}

async function fetchHDBCarparks() {
  const now = Date.now();
  if (_hdbCache && now - _hdbCacheTime < 5 * 60 * 1000) return _hdbCache;

  let records = [];
  let availJson = {};
  try {
    [records, availJson] = await Promise.all([
      fetchAllHDBInfo(),
      fetch(CARPARK_AVAILABILITY_URL).then((r) => r.json()),
    ]);
  } catch (e) {
    console.warn('[carparkService] HDB fetch failed, continuing without HDB data:', e.message);
    return [];
  }

  const availItems = availJson?.items?.[0]?.carpark_data || [];

  // Build availability lookup
  const availMap = {};
  for (const cp of availItems) {
    const carLots = cp.carpark_info?.find((i) => i.lot_type === 'C');
    if (!carLots) continue;
    availMap[cp.carpark_number] = {
      available_lots: parseInt(carLots.lots_available) || 0,
      total_capacity: parseInt(carLots.total_lots) || 0,
    };
  }

  const results = [];
  for (const r of records) {
    const x = parseFloat(r.x_coord);
    const y = parseFloat(r.y_coord);
    if (!x || !y) continue;
    const { lat, lng } = svy21ToWGS84(y, x);
    if (!inSingapore(lat, lng)) continue;
    const avail = availMap[r.car_park_no] || {};
    results.push({
      id: r.car_park_no,
      name: r.address,
      latitude: lat,
      longitude: lng,
      available_lots: avail.available_lots ?? null,
      total_capacity: avail.total_capacity ?? null,
      operating_hours: r.night_parking === 'YES' ? '24 hrs' : '7AM – 10:30PM',
      mobile_payment: r.type_of_parking_system === 'ELECTRONIC PARKING',
      free_parking: r.free_parking !== 'NO',
      erp_zone: false,
      ev_charging: false,
      surveillance_24_7: false,
      average_rating: null,
      total_ratings: 0,
      price_per_hour: null,
      source: 'HDB',
    });
  }

  console.log(`[carparkService] HDB carparks loaded: ${results.length}`);
  _hdbCache = results;
  _hdbCacheTime = now;
  return results;
}

// ─── Source 2: OneMap search — fetches ALL pages ──────────────────────────────

const CARPARK_KEYWORDS = ['car park', 'carpark', 'multi storey', 'basement car', 'surface car', 'parking'];

function isCarpark(val) {
  const v = (val || '').toLowerCase();
  return CARPARK_KEYWORDS.some((kw) => v.includes(kw));
}

async function fetchOneMapPage(searchVal, pageNum) {
  const url = `${ONEMAP_SEARCH}?searchVal=${encodeURIComponent(searchVal)}&returnGeom=Y&getAddrDetails=Y&pageNum=${pageNum}`;
  const res = await fetch(url);
  return res.json();
}

async function fetchOneMapCarparks(locationQuery) {
  try {
    const searchVal = `${locationQuery} carpark`;
    const firstPage = await fetchOneMapPage(searchVal, 1);
    const totalPages = firstPage?.totalNumPages || 1;
    let items = firstPage?.results || [];

    // Fetch remaining pages in parallel
    if (totalPages > 1) {
      const pageNums = [];
      for (let p = 2; p <= totalPages; p++) pageNums.push(p);
      const morePages = await Promise.all(pageNums.map((p) => fetchOneMapPage(searchVal, p)));
      for (const page of morePages) {
        items = items.concat(page?.results || []);
      }
    }

    const results = [];
    const seen = new Set();
    for (const r of items) {
      const lat = parseFloat(r.LATITUDE);
      const lng = parseFloat(r.LONGITUDE);
      if (!lat || !lng || !inSingapore(lat, lng)) continue;

      // Filter to only carpark-related results
      const searchval = r.SEARCHVAL || '';
      const building = r.BUILDING || '';
      if (!isCarpark(searchval) && !isCarpark(building)) continue;

      // Deduplicate by postal code
      const postalKey = r.POSTAL || `${r.X}_${r.Y}`;
      if (seen.has(postalKey)) continue;
      seen.add(postalKey);

      const name = r.ADDRESS || building || searchval;
      results.push({
        id: `ONEMAP_${postalKey}`,
        name,
        latitude: lat,
        longitude: lng,
        available_lots: null,
        total_capacity: null,
        operating_hours: '24 hrs',
        mobile_payment: true,
        free_parking: false,
        erp_zone: false,
        ev_charging: false,
        surveillance_24_7: false,
        average_rating: null,
        total_ratings: 0,
        price_per_hour: null,
        source: 'OneMap',
      });
    }

    console.log(`[carparkService] OneMap "${locationQuery}": ${items.length} raw → ${results.length} carparks (${totalPages} pages)`);
    return results;
  } catch (e) {
    console.warn('[carparkService] OneMap search failed:', e.message);
    return [];
  }
}

// ─── Dedup: HDB-first (has live data), drop OneMap duplicates within 40m ─────

function dedup(carparks) {
  const seen = [];
  return carparks.filter((cp) => {
    const dupe = seen.some(
      (s) => distMetres(s.latitude, s.longitude, cp.latitude, cp.longitude) < 40
    );
    if (!dupe) seen.push(cp);
    return !dupe;
  });
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetch all carparks — HDB (full paginated dataset, cached) + OneMap (query-specific, all pages).
 * @param {string} query - The user's search query
 */
export async function fetchLiveCarparks(query = '') {
  const [hdb, onemap] = await Promise.allSettled([
    fetchHDBCarparks(),
    query ? fetchOneMapCarparks(query) : Promise.resolve([]),
  ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : []));

  // HDB first (has live availability) — OneMap fills gaps for newer towns
  const merged = dedup([...hdb, ...onemap]);
  console.log(`[carparkService] Final merged (deduped): ${merged.length} (HDB: ${hdb.length}, OneMap new: ${merged.length - hdb.length})`);
  return merged;
}
