import mongoose from "mongoose";

const studyGuideSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  topic: { type: String, required: true },
  source: { type: String, required: true },
  readTime: { type: String, required: true },
  title: { type: String, required: true },
  introduction: { type: String, required: true },
  objectives: [{ type: String, required: true }],
  sections: [
    {
      title: { type: String, required: true },
      body: { type: String, required: true },
      bullets: [{ type: String, required: true }],
    },
  ],
  quiz: [
    {
      prompt: { type: String, required: true },
      options: [{ type: String, required: true }],
      answer: { type: Number, required: true },
      explanation: { type: String, required: true },
    },
  ],
  reflection: { type: String, required: true },
  safetyNote: { type: String, required: true },
}, { timestamps: true });

export const StudyGuide = mongoose.model("StudyGuide", studyGuideSchema);
