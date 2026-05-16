import { DEFAULT_SEARCH_RADIUS_METRES } from "../services/carparkService.js";

export type GetCarparksQuery = {
    address: string;
    radius: number;
    evCharging: boolean;
};

type ValidationSuccess<T> = { ok: true; data: T };
type ValidationError = { ok: false; error: string };
type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

export function validateGetCarparksQuery(query: Record<string, unknown>): ValidationResult<GetCarparksQuery> {
    const { address, radius, ev_charging } = query;

    if (!address || typeof address !== "string" || address.trim() === "") {
        return { ok: false, error: "address is required and must be a non-empty string" };
    }

    let parsedRadius = DEFAULT_SEARCH_RADIUS_METRES;
    if (radius !== undefined) {
        if (typeof radius !== "string" || !/^\d+$/.test(radius)) {
            return { ok: false, error: "radius must be a positive integer" };
        }
        parsedRadius = parseInt(radius, 10);
        if (parsedRadius <= 0) {
            return { ok: false, error: "radius must be greater than 0" };
        }
    }

    if (ev_charging !== undefined && ev_charging !== "true" && ev_charging !== "false") {
        return { ok: false, error: "ev_charging must be 'true' or 'false'" };
    }

    return {
        ok: true,
        data: {
            address: address.trim(),
            radius: parsedRadius,
            evCharging: ev_charging === "true",
        },
    };
}

export function validateGetCarparkByIdParam(id: unknown): ValidationResult<string> {
    if (!id || typeof id !== "string" || id.trim() === "") {
        return { ok: false, error: "id must be a non-empty string" };
    }
    return { ok: true, data: id.trim() };
}
