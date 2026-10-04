import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  duration: { type: String, required: true },
  description: { type: String, required: true },
  questions: [
    {
      prompt: { type: String, required: true },
      options: [{ type: String, required: true }],
      answer: { type: Number, required: true },
      explanation: { type: String, required: true },
    },
  ],
});

export const Lesson = mongoose.model("Lesson", lessonSchema);
