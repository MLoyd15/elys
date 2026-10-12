import mongoose from "mongoose";
import { lessonCatalog } from "../catalog.js";
import { flashcardCatalog } from "../flashcards.js";
import { studyGuideCatalog } from "../studyGuides.js";
import { Flashcard } from "../models/Flashcard.js";
import { Lesson } from "../models/Lesson.js";
import { NoteFolder } from "../models/NoteFolder.js";
import { StudyGuide } from "../models/StudyGuide.js";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required. Copy .env.example to .env and set your MongoDB connection string.");
  }
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters. Set a random secret in your local .env file.");
  }

  await mongoose.connect(uri);
  try {
    await NoteFolder.collection.dropIndex("name_1");
  } catch (error) {
    if (error.codeName !== "IndexNotFound" && error.code !== 27 && error.code !== 26) throw error;
  }
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
}