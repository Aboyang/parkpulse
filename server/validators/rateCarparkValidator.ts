type ValidationSuccess<T> = { ok: true; data: T };
type ValidationError = { ok: false; error: string };
type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

export type RateCarparkBody = { carparkId: string; userId: string; rating: number; comment?: string };

export function validateRateCarparkBody(body: Record<string, unknown>): ValidationResult<RateCarparkBody> {
    const { carparkId, userId, rating, comment } = body;

    if (!carparkId || typeof carparkId !== "string" || carparkId.trim() === "") {
        return { ok: false, error: "carparkId is required and must be a non-empty string" };
    }
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
        return { ok: false, error: "userId is required and must be a non-empty string" };
    }
    if (typeof rating !== "number" || !Number.isFinite(rating) || rating < 1 || rating > 5) {
        return { ok: false, error: "rating must be a number between 1 and 5" };
    }
    if (comment !== undefined && typeof comment !== "string") {
        return { ok: false, error: "comment must be a string" };
    }

    return { ok: true, data: { carparkId: carparkId.trim(), userId: userId.trim(), rating, comment: comment as string | undefined } };
}

export function validateGetCarparkRatingParam(carparkId: unknown): ValidationResult<string> {
    if (!carparkId || typeof carparkId !== "string" || carparkId.trim() === "") {
        return { ok: false, error: "carparkId must be a non-empty string" };
    }
    return { ok: true, data: carparkId.trim() };
}
