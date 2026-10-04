import { Router } from "express";
import { lessonCatalog } from "../catalog.js";
import { Lesson } from "../models/Lesson.js";
import { Progress } from "../models/Progress.js";
import { Task } from "../models/Task.js";

const router = Router();

router.get("/", async (_request, response, next) => {
  try {
    const [lessons, tasks, progress] = await Promise.all([
      Lesson.find().lean(),
      Task.find().sort({ completed: 1, createdAt: 1 }).lean(),
      Progress.findOne({ key: "default" }).lean(),
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
        weeklyMinutes: progress.weeklyMinutes,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
