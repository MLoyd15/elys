import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const sessionCookie = "nursepath_access";
export const sessionDurationSeconds = 7 * 24 * 60 * 60;

function safeEqual(left, right) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function sessionSignature(expiresAt) {
  return createHmac("sha256", process.env.SESSION_SECRET).update(expiresAt).digest("base64url");
}

export function hasValidSession(request) {
  const cookie = request.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${sessionCookie}=`));
  if (!cookie) return false;

  const [expiresAt, signature] = decodeURIComponent(cookie.slice(sessionCookie.length + 1)).split(".");
  if (!expiresAt || !signature || Number(expiresAt) <= Date.now()) return false;
  return safeEqual(signature, sessionSignature(expiresAt));
}

export function setSessionCookie(response, expiresAt) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `${sessionCookie}=${expiresAt}.${sessionSignature(expiresAt)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${sessionDurationSeconds}${secure}`,
  );
}

export function clearSessionCookie(response) {
  response.setHeader(
    "Set-Cookie",
    `${sessionCookie}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
}

export { safeEqual };
