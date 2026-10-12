import { Router } from "express";
import { flashcardCatalog } from "../flashcards.js";
import { Flashcard } from "../models/Flashcard.js";

const router = Router();

router.get("/", async (request, response, next) => {
  try {
    const filter = { $or: [{ userId: request.userId }, { userId: { $exists: false } }] };
    if (typeof request.query.topic === "string" && request.query.topic !== "All topics") {
      filter.topic = request.query.topic;
    }
    if (typeof request.query.studyGuide === "string") {
      filter.studyGuideSlug = request.query.studyGuide;
    }
    const cards = await Flashcard.find(filter).lean();
    cards.sort((a, b) => {
      const indexA = flashcardCatalog.findIndex((card) => card.slug === a.slug);
      const indexB = flashcardCatalog.findIndex((card) => card.slug === b.slug);
      if (indexA >= 0 && indexB >= 0) return indexA - indexB;
      if (indexA >= 0) return -1;
      if (indexB >= 0) return 1;
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });
    response.json(cards.map(({ slug, topic, source, question, answer, hint, userId, studyGuideSlug }) => ({
      slug,
      studyGuideSlug,
      topic,
      source: source || "General nursing review",
      question,
      answer,
      hint,
      userOwned: Boolean(userId),
    })));
  } catch (error) {
    next(error);
  }
});

router.delete("/:slug", async (request, response, next) => {
  try {
    const card = await Flashcard.findOneAndDelete({ slug: request.params.slug, userId: request.userId });
    if (!card) return response.status(404).json({ error: "Your flashcard was not found." });
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;