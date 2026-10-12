import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    key: { type: String, default: "default", index: true },
    startedAt: { type: Date, required: true, default: Date.now },
    endedAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

export const StudySession = mongoose.model("StudySession", studySessionSchema);
