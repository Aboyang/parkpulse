import { carparkDB } from "../data/carparkDB.js";
import { Carpark } from "../models/carpark.js";
import type { FavoriteCarpark } from "../models/favoriteCarpark.js";

export function enrichFavoriteWithCarpark(favorite: FavoriteCarpark): ReturnType<FavoriteCarpark["toJSON"]> {
  const raw = carparkDB.find((c) => c.car_park_no === favorite.carparkId);
  const carpark = new Carpark(raw!);
  return favorite.toJSON(carpark);
}
