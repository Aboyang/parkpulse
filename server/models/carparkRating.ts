interface RatingCommentRecord {
  userId: string;
  comment: string;
}

interface CarparkRatingRecord {
  carparkId: string;
  averageRating?: number;
  totalRatings?: number;
  comments?: RatingCommentRecord[];
}

export class RatingComment {
  userId: string;
  comment: string;

  constructor({ userId, comment }: RatingCommentRecord) {
    this.userId = userId;
    this.comment = comment;
  }
}

export class CarparkRating {
  carparkId: string;
  averageRating: number;
  totalRatings: number;
  comments: RatingComment[];

  constructor({ carparkId, averageRating = 0, totalRatings = 0, comments = [] }: CarparkRatingRecord) {
    this.carparkId = carparkId;
    this.averageRating = averageRating;
    this.totalRatings = totalRatings;
    this.comments = comments.map((c) => new RatingComment(c));
  }

  addRating(userId: string, rating: number, comment?: string): void {
    this.totalRatings += 1;
    this.averageRating =
      (this.averageRating * (this.totalRatings - 1) + rating) / this.totalRatings;
    if (comment !== undefined) {
      this.comments.push(new RatingComment({ userId, comment }));
    }
  }

  toDB(): { carparkId: string; averageRating: number; totalRatings: number; comments: RatingCommentRecord[] } {
    return {
      carparkId: this.carparkId,
      averageRating: this.averageRating,
      totalRatings: this.totalRatings,
      comments: this.comments.map((c) => ({ userId: c.userId, comment: c.comment })),
    };
  }

  toJSON(): { carparkId: string; averageRating: number; totalRatings: number; comments: RatingCommentRecord[] } {
    return {
      carparkId: this.carparkId,
      averageRating: this.averageRating,
      totalRatings: this.totalRatings,
      comments: this.comments.map((c) => ({ userId: c.userId, comment: c.comment })),
    };
  }

  static fromDB(item: Record<string, unknown>): CarparkRating {
    return new CarparkRating(item as unknown as CarparkRatingRecord);
  }

  static empty(carparkId: string): CarparkRating {
    return new CarparkRating({ carparkId });
  }
}
