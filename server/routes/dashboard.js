import { Router } from "express";
import { lessonCatalog } from "../catalog.js";
import { Lesson } from "../models/Lesson.js";
import { Progress } from "../models/Progress.js";
import { Task } from "../models/Task.js";
import { StudySession } from "../models/StudySession.js";
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

export default router;
