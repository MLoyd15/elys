import { Router } from "express";
import { studyGuideCatalog } from "../studyGuides.js";
import { maxStudyTextCharacters } from "../config/limits.js";
import { Flashcard } from "../models/Flashcard.js";
import { Progress } from "../models/Progress.js";
import { StudyGuide } from "../models/StudyGuide.js";
import { buildStudyGuide } from "../services/studyGuideBuilder.js";
import { generateStudyMaterials } from "../services/gemini.js";
import { awardProgress } from "../services/progress.js";

const router = Router();

router.get("/", async (request, response, next) => {
  try {
    const guides = await StudyGuide.find({ $or: [{ userId: request.userId }, { userId: { $exists: false } }] }).lean();
    guides.sort((a, b) => {
      const indexA = studyGuideCatalog.findIndex((guide) => guide.slug === a.slug);
      const indexB = studyGuideCatalog.findIndex((guide) => guide.slug === b.slug);
      if (indexA >= 0 && indexB >= 0) return indexA - indexB;
      if (indexA >= 0) return -1;
      if (indexB >= 0) return 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    response.json(guides.map(({
      slug,
      topic,
      source,
      readTime,
      title,
      introduction,
      objectives,
      sections,
      reflection,
      safetyNote,
      userId,
    }) => ({
      slug,
      userOwned: Boolean(userId),
      topic,
      source,
      readTime,
      title,
      introduction,
      objectives,
      sections: sections.map(({ title: sectionTitle, body, bullets }) => ({
        title: sectionTitle,
        body,
        bullets,
      })),
      reflection,
      safetyNote,
    })));
  } catch (error) {
    next(error);
  }
});

router.post("/generate", async (request, response, next) => {
  try {
    const fileName = typeof request.body?.fileName === "string" ? request.body.fileName.trim() : "";
    const text = typeof request.body?.text === "string" ? request.body.text.trim() : "";
    if (!fileName || fileName.length > 180 || !text) {
      return response.status(400).json({ error: "Provide a source name and non-empty text." });
    }
    if (text.length > maxStudyTextCharacters) {
      return response.status(413).json({ error: "Study material must be 10,000 characters or fewer. Shorten the text and try again." });
    }

    const generatedText = await generateStudyMaterials({ fileName, text });
    const { guide, flashcards } = buildStudyGuide(generatedText, fileName, text);
    let savedGuide;
    try {
      savedGuide = await StudyGuide.create({ ...guide, userId: request.userId });
      await Flashcard.insertMany(flashcards.map((card) => ({ ...card, userId: request.userId })));
    } catch (saveError) {
      await Promise.all([
        Flashcard.deleteMany({ studyGuideSlug: guide.slug, userId: request.userId }),
        savedGuide ? StudyGuide.deleteOne({ _id: savedGuide._id }) : Promise.resolve(),
      ]);
      throw saveError;
    }

    response.status(201).json({
      guide: {
        slug: guide.slug,
        userOwned: true,
        topic: guide.topic,
        source: guide.source,
        readTime: guide.readTime,
        title: guide.title,
        introduction: guide.introduction,
        objectives: guide.objectives,
        sections: guide.sections,
        reflection: guide.reflection,
        safetyNote: guide.safetyNote,
      },
      flashcardCount: flashcards.length,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:slug/quiz", async (request, response, next) => {
  try {
    const guide = await StudyGuide.findOne({ slug: request.params.slug, $or: [{ userId: request.userId }, { userId: { $exists: false } }] }).lean();
    if (!guide) return response.status(404).json({ error: "Study guide not found." });
    response.json({
      kind: "study-guide",
      slug: guide.slug,
      title: `${guide.topic} quiz`,
      category: guide.topic,
      icon: "📘",
      color: "mint",
      duration: "10 questions",
      description: `Check your understanding of ${guide.topic}.`,
      questions: guide.quiz,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:slug/attempt", async (request, response, next) => {
  try {
    const guide = await StudyGuide.findOne({ slug: request.params.slug, $or: [{ userId: request.userId }, { userId: { $exists: false } }] }).lean();
    if (!guide) return response.status(404).json({ error: "Study guide not found." });
    const answers = request.body?.answers;
    if (
      !Array.isArray(answers)
      || answers.length !== guide.quiz.length
      || answers.some(
        (answer, index) =>
          !Number.isInteger(answer) || answer < 0 || answer >= guide.quiz[index].options.length,
      )
    ) {
      return response.status(400).json({ error: "Submit one valid answer for every question." });
    }

    const correct = answers.reduce(
      (count, answer, index) => count + Number(answer === guide.quiz[index].answer),
      0,
    );
    const earnedXp = correct * 10 + (correct === guide.quiz.length ? 10 : 0);
    const progress = await Progress.findOne({ userId: request.userId });
    if (!progress) throw new Error("Study progress is not initialized.");
    const { awardedXp, isFirstCompletion } = await awardProgress(progress, {
      completionField: "completedStudyQuizzes",
      slug: guide.slug,
      earnedXp,
    });

    response.json({
      correct,
      total: guide.quiz.length,
      earnedXp: awardedXp,
      completed: isFirstCompletion,
      xp: progress.xp,
      streak: progress.streak,
    });
  } catch (error) {
    next(error);
  }
});


router.delete("/:slug", async (request, response, next) => {
  try {
    const guide = await StudyGuide.findOneAndDelete({ slug: request.params.slug, userId: request.userId });
    if (!guide) return response.status(404).json({ error: "Your study guide was not found." });
    await Promise.all([
      Flashcard.deleteMany({ studyGuideSlug: guide.slug, userId: request.userId }),
      Progress.updateOne({ userId: request.userId }, { $pull: { completedStudyQuizzes: guide.slug } }),
    ]);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});
export default router;
