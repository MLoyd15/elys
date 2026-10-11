import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: "default" },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  completedLessons: [{ type: String }],
  completedStudyQuizzes: [{ type: String }],
  lastStudyDate: { type: String, default: "" },
});

export const Progress = mongoose.model("Progress", progressSchema);
