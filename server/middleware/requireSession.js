import mongoose from "mongoose";
import { getSessionUserId } from "../utils/session.js";

export function requireSession(request, response, next) {
  const userId = getSessionUserId(request);
  if (!userId || !mongoose.isValidObjectId(userId)) {
    return response.status(401).json({ error: "Log in to continue." });
  }
  request.userId = userId;
  next();
}