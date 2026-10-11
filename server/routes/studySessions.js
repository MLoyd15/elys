import mongoose from "mongoose";
import { Router } from "express";
import { StudySession } from "../models/StudySession.js";
import { getWeeklyStudySeconds, serializeStudySession, startOfStudyWeek } from "../services/studySessions.js";

const router = Router();

async function readStudySummary(now = new Date()) {
  const weekStart = startOfStudyWeek(now);
  const [sessions, activeSession, weeklySessions] = await Promise.all([
    StudySession.find().sort({ startedAt: -1 }).limit(30).lean(),
    StudySession.findOne({ endedAt: null }).sort({ startedAt: -1 }).lean(),
    StudySession.find({
      startedAt: { $lt: now },
      $or: [{ endedAt: null }, { endedAt: { $gte: weekStart } }],
    }).lean(),
  ]);
  return {
    sessions: sessions.map((session) => serializeStudySession(session, now)),
    activeSession: activeSession ? serializeStudySession(activeSession, now) : null,
    weeklyMinutes: Math.floor(getWeeklyStudySeconds(weeklySessions, now) / 60),
  };
}

router.get("/", async (_request, response, next) => {
  try {
    response.json(await readStudySummary());
  } catch (error) {
    next(error);
  }
});

router.post("/start", async (_request, response, next) => {
  try {
    const active = await StudySession.findOne({ endedAt: null }).sort({ startedAt: -1 });
    if (active) return response.json({ session: serializeStudySession(active) });
    const session = await StudySession.create({ startedAt: new Date() });
    response.status(201).json({ session: serializeStudySession(session) });
  } catch (error) {
    next(error);
  }
});

router.post("/stop", async (_request, response, next) => {
  try {
    const session = await StudySession.findOne({ endedAt: null }).sort({ startedAt: -1 });
    if (!session) return response.status(404).json({ error: "There is no active study timer." });
    const now = new Date();
    session.endedAt = now;
    session.durationSeconds = Math.max(0, Math.floor((now.getTime() - session.startedAt.getTime()) / 1000));
    await session.save();
    response.json({ session: serializeStudySession(session, now), ...(await readStudySummary(now)) });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(400).json({ error: "Invalid study session ID." });
    }
    const session = await StudySession.findOneAndDelete({ _id: request.params.id, endedAt: { $ne: null } });
    if (!session) return response.status(404).json({ error: "Completed study session not found." });
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
