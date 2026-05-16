type ValidationSuccess<T> = { ok: true; data: T };
type ValidationError = { ok: false; error: string };
type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

export type RouteBody = { start: [number, number]; end: [number, number] };

function isLatLng(value: unknown): value is [number, number] {
    return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
}

export function validateRouteBody(body: Record<string, unknown>): ValidationResult<RouteBody> {
    const { start, end } = body;

    if (!isLatLng(start)) {
        return { ok: false, error: "start must be a [lat, lng] array of numbers" };
    }
    if (!isLatLng(end)) {
        return { ok: false, error: "end must be a [lat, lng] array of numbers" };
    }

    return { ok: true, data: { start, end } };
}
