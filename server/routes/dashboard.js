import { Router } from "express";
import { lessonCatalog } from "../catalog.js";
import { Lesson } from "../models/Lesson.js";
import { Progress } from "../models/Progress.js";
import { Task } from "../models/Task.js";
import { StudySession } from "../models/StudySession.js";
import { User } from "../models/User.js";
import { getWeeklyStudySeconds, startOfStudyWeek } from "../services/studySessions.js";

const router = Router();

router.get("/", async (request, response, next) => {
  try {
    const now = new Date();
    const weekStart = startOfStudyWeek(now);
    const [lessons, tasks, progress, studySessions] = await Promise.all([
      Lesson.find().lean(),
      Task.find({ userId: request.userId }).sort({ completed: 1, createdAt: 1 }).lean(),
      Progress.findOne({ userId: request.userId }).lean(),
      StudySession.find({ userId: request.userId, startedAt: { $lt: now },
        $or: [{ endedAt: null }, { endedAt: { $gte: weekStart } }],
      }).lean(),
    ]);
    if (!progress) throw new Error("Study progress is not initialized.");

    response.json({
      lessons: lessons
        .sort((a, b) => lessonCatalog.findIndex((lesson) => lesson.slug === a.slug) - lessonCatalog.findIndex((lesson) => lesson.slug === b.slug))
        .map(({ slug, title, category, icon, color, duration, description }) => ({
          slug,
          title,
          category,
          icon,
          color,
          duration,
          description,
          completed: progress.completedLessons.includes(slug),
        })),
      tasks: tasks.map(({ _id, title, completed, dueLabel, dueDate }) => ({
        id: _id.toString(),
        title,
        completed,
        dueLabel,
        dueDate: dueDate || "",
      })),
      progress: {
        xp: progress.xp,
        streak: progress.streak,
        completedCount: (progress.completedStudyQuizzes || []).length,
        completedStudyQuizzes: progress.completedStudyQuizzes || [],
        weeklyMinutes: Math.floor(getWeeklyStudySeconds(studySessions, now) / 60),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/leaderboard", async (request, response, next) => {
  try {
    const [progressRecords, users] = await Promise.all([
      Progress.find({ userId: { $exists: true } }).lean(),
      User.find().select("_id name companion").lean(),
    ]);
    const nameById = new Map(users.map((user) => [user._id.toString(), user.name]));
    const companionById = new Map(users.map((user) => [user._id.toString(), user.companion || ""]));
    const players = progressRecords
      .filter((record) => record.userId && nameById.has(record.userId.toString()))
      .map((record) => ({
        id: record.userId.toString(),
        name: nameById.get(record.userId.toString()),
        companion: companionById.get(record.userId.toString()) || "",
        xp: record.xp || 0,
        streak: record.streak || 0,
        completedQuizzes: (record.completedStudyQuizzes || []).length,
      }))
      .sort((a, b) => b.xp - a.xp || b.completedQuizzes - a.completedQuizzes || b.streak - a.streak || a.name.localeCompare(b.name))
      .map((player, index) => ({ ...player, rank: index + 1 }));
    response.json({ players, currentUserId: request.userId.toString() });
  } catch (error) {
    next(error);
  }
});
export default router;
