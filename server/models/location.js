export class Location {
  constructor({ lat, lng }) {
    this.lat = lat;
    this.lng = lng;
  }

  toJSON() {
    return { lat: this.lat, lng: this.lng };
  }

  static fromIPApi(data) {
    return new Location({ lat: data.lat, lng: data.lon }); // lon → lng normalized here
  }
}