import type { CarparkAvailabilityApiEntry } from "../types/carpark.js";

interface AvailabilityInfo {
  lots_available: string;
  total_lots: string;
}

export class CarparkAvailability {
  carparkNo: string;
  availableLots: number | null;
  totalLots: number | null;

  constructor(carparkNo: string, info: AvailabilityInfo | null | undefined) {
    this.carparkNo = carparkNo;
    this.availableLots = info ? parseInt(info.lots_available) : null;
    this.totalLots = info ? parseInt(info.total_lots) : null;
  }

  isFull(): boolean {
    return this.availableLots === 0;
  }

  hasData(): boolean {
    return this.availableLots !== null;
  }

  static fromApiData(apiEntry: CarparkAvailabilityApiEntry): CarparkAvailability {
    const info = apiEntry?.carpark_info?.[0];
    return new CarparkAvailability(apiEntry.carpark_number, info);
  }
}
