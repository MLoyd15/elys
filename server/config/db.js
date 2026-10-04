import mongoose from "mongoose";
import { lessonCatalog } from "../catalog.js";
import { flashcardCatalog } from "../flashcards.js";
import { studyGuideCatalog } from "../studyGuides.js";
import { Flashcard } from "../models/Flashcard.js";
import { Lesson } from "../models/Lesson.js";
import { Progress } from "../models/Progress.js";
import { StudyGuide } from "../models/StudyGuide.js";
import { Task } from "../models/Task.js";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required. Copy .env.example to .env and set your MongoDB connection string.");
  }
  if (!process.env.ACCESS_CODE) {
    throw new Error("ACCESS_CODE is required. Set it in your local .env file.");
  }
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters. Set a random secret in your local .env file.");
  }

  await mongoose.connect(uri);
  await seedDatabase();
}

async function seedDatabase() {
  await Promise.all(
    lessonCatalog.map((lesson) =>
      Lesson.updateOne({ slug: lesson.slug }, { $setOnInsert: lesson }, { upsert: true }),
    ),
  );
  await Promise.all(
    flashcardCatalog.map(({ source, topic, ...flashcard }) =>
      Flashcard.updateOne(
        { slug: flashcard.slug },
        {
          $setOnInsert: flashcard,
          $set: { topic, source: source || "General nursing review" },
        },
        { upsert: true },
      ),
    ),
  );
  await Promise.all(
    studyGuideCatalog.map((guide) =>
      StudyGuide.updateOne({ slug: guide.slug }, { $set: guide }, { upsert: true }),
    ),
  );
  const progressSeed = await Progress.updateOne(
    { key: "default" },
    { $setOnInsert: { key: "default" } },
    { upsert: true },
  );
  if (progressSeed.upsertedCount === 1) {
    await Task.insertMany([
      { title: "Review medication calculation notes", dueLabel: "Today" },
      { title: "Complete maternal-newborn practice questions", dueLabel: "Today" },
      { title: "Pack clinical placement essentials", dueLabel: "Tomorrow" },
    ]);
  }
}
