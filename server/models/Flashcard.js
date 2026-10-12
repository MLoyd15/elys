import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  slug: { type: String, required: true, unique: true },
  studyGuideSlug: { type: String, default: "" },
  topic: { type: String, required: true },
  source: { type: String, default: "General nursing review" },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  hint: { type: String, required: true },
}, { timestamps: true });

export const Flashcard = mongoose.model("Flashcard", flashcardSchema);
