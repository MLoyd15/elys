import { Router } from "express";
import { clearSessionCookie, safeEqual, sessionDurationSeconds, setSessionCookie } from "../utils/session.js";

const router = Router();
const loginAttempts = new Map();

router.post("/unlock", (request, response) => {
  const now = Date.now();
  const attempt = loginAttempts.get(request.ip);
  if (attempt && attempt.resetAt <= now) loginAttempts.delete(request.ip);
  const currentAttempt = loginAttempts.get(request.ip);
  if (currentAttempt?.count >= 5) {
    return response.status(429).json({ error: "Too many attempts. Please wait 15 minutes and try again." });
  }

  const submittedCode = typeof request.body?.accessCode === "string" ? request.body.accessCode : "";
  if (!safeEqual(submittedCode, process.env.ACCESS_CODE)) {
    const nextAttempt = currentAttempt || { count: 0, resetAt: now + 15 * 60 * 1000 };
    nextAttempt.count += 1;
    loginAttempts.set(request.ip, nextAttempt);
    return response.status(401).json({ error: "That access code doesn’t match. Try again." });
  }

  loginAttempts.delete(request.ip);
  const expiresAt = String(now + sessionDurationSeconds * 1000);
  setSessionCookie(response, expiresAt);
  response.json({ unlocked: true });
});

router.post("/lock", (_request, response) => {
  clearSessionCookie(response);
  response.status(204).end();
});

export default router;
