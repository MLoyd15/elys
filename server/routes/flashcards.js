import { Router } from "express";
import { flashcardCatalog } from "../flashcards.js";
import { Flashcard } from "../models/Flashcard.js";

const router = Router();

router.get("/", async (request, response, next) => {
  try {
    const filter = {};
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
    response.json(cards.map(({ slug, topic, source, question, answer, hint }) => ({
      slug,
      topic,
      source: source || "General nursing review",
      question,
      answer,
      hint,
    })));
  } catch (error) {
    next(error);
  }
});

export default router;
