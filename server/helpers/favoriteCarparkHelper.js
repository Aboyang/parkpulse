import { carparkDB } from "../data/carparkDB.js";
import { Carpark } from "../models/carpark.js";

export function enrichFavoriteWithCarpark(favorite) {
  const raw = carparkDB.find((c) => c.car_park_no === favorite.carparkId);
  const carpark = new Carpark(raw);
  return favorite.toJSON(carpark);
}
