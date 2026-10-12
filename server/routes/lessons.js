import { Router } from "express";
import { Lesson } from "../models/Lesson.js";
import { Progress } from "../models/Progress.js";
import { awardProgress } from "../services/progress.js";

const router = Router();

router.get("/:slug", async (request, response, next) => {
  try {
    const lesson = await Lesson.findOne({ slug: request.params.slug }).lean();
    if (!lesson) return response.status(404).json({ error: "Lesson not found." });
    response.json(lesson);
  } catch (error) {
    next(error);
  }
});

router.post("/:slug/attempt", async (request, response, next) => {
  try {
    const lesson = await Lesson.findOne({ slug: request.params.slug });
    if (!lesson) return response.status(404).json({ error: "Lesson not found." });
    const answers = request.body?.answers;
    if (
      !Array.isArray(answers)
      || answers.length !== lesson.questions.length
      || answers.some(
        (answer, index) =>
          !Number.isInteger(answer) || answer < 0 || answer >= lesson.questions[index].options.length,
      )
    ) {
      return response.status(400).json({ error: "Submit one valid answer for every question." });
    }

    const correct = answers.reduce(
      (count, answer, index) => count + Number(answer === lesson.questions[index].answer),
      0,
    );
    const earnedXp = correct * 10 + (correct === lesson.questions.length ? 10 : 0);
    const progress = await Progress.findOne({ userId: request.userId });
    if (!progress) throw new Error("Study progress is not initialized.");
    const { awardedXp, isFirstCompletion } = await awardProgress(progress, {
      completionField: "completedLessons",
      slug: lesson.slug,
      earnedXp,
    });

    response.json({
      correct,
      total: lesson.questions.length,
      earnedXp: awardedXp,
      completed: isFirstCompletion,
      xp: progress.xp,
      streak: progress.streak,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
