import proj4 from "proj4";

// Use built-in EPSG definitions
proj4.defs("EPSG:3414",
  "+proj=tmerc +lat_0=1.36666666666667 +lon_0=103.833333333333 " +
  "+k=1 +x_0=28001.642 +y_0=38744.572 +ellps=GRS80 +units=m +no_defs"
);

export function latLonToSVY21(lat, lon) {
  const [easting, northing] = proj4("EPSG:4326", "EPSG:3414", [lon, lat]);
  return { easting, northing };
}

export function svy21ToLatLon(easting, northing) {
  const [lon, lat] = proj4("EPSG:3414", "EPSG:4326", [easting, northing]);
  return { latitude: lat, longitude: lon };
}