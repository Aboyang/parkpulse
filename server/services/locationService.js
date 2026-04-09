class LocationService {
  constructor() {}

  async getCurrentLocation() {
    try {
      const res = await fetch('http://ip-api.com/json/');
      const data = await res.json();

      return {
        lat: data.lat,
        lng: data.lon
      }

    } catch (err) {
      console.error('Failed to get location:', err);
      return null;
    }
  }
}

export default LocationService;

// Testing
// (async () => {
//   const location = new LocationService();
//   const coord = await location.getCurrentLocation();
//   console.log(coord);
// })();