type ValidationSuccess<T> = { ok: true; data: T };
type ValidationError = { ok: false; error: string };
type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

export type FavoriteBody = { userId: string; carparkId: string };

export function validateFavoriteBody(body: Record<string, unknown>): ValidationResult<FavoriteBody> {
    const { userId, carparkId } = body;

    if (!userId || typeof userId !== "string" || userId.trim() === "") {
        return { ok: false, error: "userId is required and must be a non-empty string" };
    }
    if (!carparkId || typeof carparkId !== "string" || carparkId.trim() === "") {
        return { ok: false, error: "carparkId is required and must be a non-empty string" };
    }

    return { ok: true, data: { userId: userId.trim(), carparkId: carparkId.trim() } };
}

export function validateUserIdParam(userId: unknown): ValidationResult<string> {
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
        return { ok: false, error: "userId must be a non-empty string" };
    }
    return { ok: true, data: userId.trim() };
}

export function validateFavoriteParams(userId: unknown, carparkId: unknown): ValidationResult<FavoriteBody> {
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
        return { ok: false, error: "userId must be a non-empty string" };
    }
    if (!carparkId || typeof carparkId !== "string" || carparkId.trim() === "") {
        return { ok: false, error: "carparkId must be a non-empty string" };
    }
    return { ok: true, data: { userId: userId.trim(), carparkId: carparkId.trim() } };
}
