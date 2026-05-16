import crypto from "crypto";

export function computeSecretHash(
  username: string,
  appClientId: string | undefined,
  appClientSecret: string | undefined
): string | undefined {
  if (!appClientSecret) return undefined;
  return crypto
    .createHmac("SHA256", appClientSecret)
    .update(username + appClientId)
    .digest("base64");
}

export function decodeIdToken(idToken: string): { sub: string; [key: string]: unknown } {
  const payload = idToken.split(".")[1];
  if (!payload) throw new Error("Invalid token format");
  return JSON.parse(
    Buffer.from(payload, "base64url").toString("utf8")
  ) as { sub: string; [key: string]: unknown };
}
