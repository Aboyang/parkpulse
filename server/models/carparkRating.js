export class RatingComment {
  constructor({ userId, comment }) {
    this.userId = userId;
    this.comment = comment;
  }
}

export class CarparkRating {
  constructor({ carparkId, averageRating = 0, totalRatings = 0, comments = [] }) {
    this.carparkId = carparkId;
    this.averageRating = averageRating;
    this.totalRatings = totalRatings;
    this.comments = comments.map((c) => new RatingComment(c));
  }

  // Core business logic — was scattered inline in the service
  addRating(userId, rating, comment) {
    this.totalRatings += 1;
    this.averageRating =
      (this.averageRating * (this.totalRatings - 1) + rating) / this.totalRatings;
    this.comments.push(new RatingComment({ userId, comment }));
  }

  toDB() {
    return {
      carparkId: this.carparkId,
      averageRating: this.averageRating,
      totalRatings: this.totalRatings,
      comments: this.comments.map((c) => ({ userId: c.userId, comment: c.comment })),
    };
  }

  toJSON() {
    return {
      carparkId: this.carparkId,
      averageRating: this.averageRating,
      totalRatings: this.totalRatings,
      comments: this.comments.map((c) => ({ userId: c.userId, comment: c.comment })),
    };
  }

  static fromDB(item) {
    return new CarparkRating(item);
  }

  // Default empty rating when carpark has no ratings yet
  static empty(carparkId) {
    return new CarparkRating({ carparkId });
  }
}