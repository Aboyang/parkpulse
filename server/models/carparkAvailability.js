export class CarparkAvailability {
  constructor(carparkNo, info) {
    this.carparkNo = carparkNo;
    this.availableLots = info ? parseInt(info.lots_available) : null;
    this.totalLots = info ? parseInt(info.total_lots) : null;
  }

  isFull() {
    return this.availableLots === 0;
  }

  hasData() {
    return this.availableLots !== null;
  }

  static fromApiData(apiEntry) {
    const info = apiEntry?.carpark_info?.[0];
    return new CarparkAvailability(apiEntry.carpark_number, info);
  }
}