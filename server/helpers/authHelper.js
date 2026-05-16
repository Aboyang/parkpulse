import crypto from "crypto";

export function computeSecretHash(username, appClientId, appClientSecret) {
  if (!appClientSecret) return undefined;
  return crypto
    .createHmac("SHA256", appClientSecret)
    .update(username + appClientId)
    .digest("base64");
}

export function decodeIdToken(idToken) {
  return JSON.parse(
    Buffer.from(idToken.split(".")[1], "base64url").toString("utf8")
  );
}
