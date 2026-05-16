import proj4 from "proj4";

proj4.defs("EPSG:3414",
  "+proj=tmerc +lat_0=1.36666666666667 +lon_0=103.833333333333 " +
  "+k=1 +x_0=28001.642 +y_0=38744.572 +ellps=GRS80 +units=m +no_defs"
);

export function latLonToSVY21(lat: number, lon: number): { easting: number; northing: number } {
  const [easting, northing] = proj4("EPSG:4326", "EPSG:3414", [lon, lat]) as [number, number];
  return { easting, northing };
}

export function svy21ToLatLon(easting: number, northing: number): { latitude: number; longitude: number } {
  const [lon, lat] = proj4("EPSG:3414", "EPSG:4326", [easting, northing]) as [number, number];
  return { latitude: lat, longitude: lon };
}
