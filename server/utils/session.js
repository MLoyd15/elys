import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const sessionCookie = "nursepath_access";
export const sessionDurationSeconds = 7 * 24 * 60 * 60;

function safeEqual(left, right) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function sessionSignature(payload) {
  return createHmac("sha256", process.env.SESSION_SECRET).update(payload).digest("base64url");
}

function readSession(request) {
  const cookie = request.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(sessionCookie + "="));
  if (!cookie) return null;

  let decoded;
  try {
    decoded = decodeURIComponent(cookie.slice(sessionCookie.length + 1));
  } catch {
    return null;
  }
  const [userId, expiresAt, signature] = decoded.split(".");
  const payload = userId + "." + expiresAt;
  if (!userId || !expiresAt || !signature || Number(expiresAt) <= Date.now()) return null;
  if (!safeEqual(signature, sessionSignature(payload))) return null;
  return userId;
}

export function getSessionUserId(request) {
  return readSession(request);
}

export function hasValidSession(request) {
  return Boolean(readSession(request));
}

export function setSessionCookie(response, userId, expiresAt = String(Date.now() + sessionDurationSeconds * 1000)) {
  const payload = userId + "." + expiresAt;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    sessionCookie + "=" + payload + "." + sessionSignature(payload) + "; HttpOnly; SameSite=Lax; Path=/; Max-Age=" + sessionDurationSeconds + secure,
  );
}

export function clearSessionCookie(response) {
  response.setHeader(
    "Set-Cookie",
    sessionCookie + "=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" + (process.env.NODE_ENV === "production" ? "; Secure" : ""),
  );
}

export { safeEqual };