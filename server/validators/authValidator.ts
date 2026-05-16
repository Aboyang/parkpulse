type ValidationSuccess<T> = { ok: true; data: T };
type ValidationError = { ok: false; error: string };
type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

export type SignUpBody = { email: string; password: string; name: string };
export type ConfirmSignUpBody = { email: string; code: string };
export type LoginBody = { email: string; password: string };
export type LogoutBody = { accessToken: string };

function requireNonEmptyString(value: unknown, field: string): string | null {
    if (!value || typeof value !== "string" || value.trim() === "") {
        return `${field} is required and must be a non-empty string`;
    }
    return null;
}

export function validateSignUpBody(body: Record<string, unknown>): ValidationResult<SignUpBody> {
    const { email, password, name } = body;
    const err = requireNonEmptyString(email, "email") ?? requireNonEmptyString(password, "password") ?? requireNonEmptyString(name, "name");
    if (err) return { ok: false, error: err };
    return { ok: true, data: { email: (email as string).trim(), password: password as string, name: (name as string).trim() } };
}

export function validateConfirmSignUpBody(body: Record<string, unknown>): ValidationResult<ConfirmSignUpBody> {
    const { email, code } = body;
    const err = requireNonEmptyString(email, "email") ?? requireNonEmptyString(code, "code");
    if (err) return { ok: false, error: err };
    return { ok: true, data: { email: (email as string).trim(), code: (code as string).trim() } };
}

export function validateLoginBody(body: Record<string, unknown>): ValidationResult<LoginBody> {
    const { email, password } = body;
    const err = requireNonEmptyString(email, "email") ?? requireNonEmptyString(password, "password");
    if (err) return { ok: false, error: err };
    return { ok: true, data: { email: (email as string).trim(), password: password as string } };
}

export function validateLogoutBody(body: Record<string, unknown>): ValidationResult<LogoutBody> {
    const err = requireNonEmptyString(body.accessToken, "accessToken");
    if (err) return { ok: false, error: err };
    return { ok: true, data: { accessToken: body.accessToken as string } };
}

export function validateGetUserProfileParam(userId: unknown): ValidationResult<string> {
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
        return { ok: false, error: "userId must be a non-empty string" };
    }
    return { ok: true, data: userId.trim() };
}
