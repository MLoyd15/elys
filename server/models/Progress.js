import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  key: { type: String, unique: true, default: "default" },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  completedLessons: [{ type: String }],
  completedStudyQuizzes: [{ type: String }],
  lastStudyDate: { type: String, default: "" },
});

export const Progress = mongoose.model("Progress", progressSchema);
