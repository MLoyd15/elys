import { hasValidSession } from "../utils/session.js";

export function requireSession(request, response, next) {
  if (!hasValidSession(request)) {
    return response.status(401).json({ error: "Enter the access code to continue." });
  }
  next();
}
