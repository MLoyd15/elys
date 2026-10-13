import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  yearLevel: { type: String, trim: true, maxlength: 50, default: "" },
  examDate: { type: String, default: "" },
  dailyGoalMinutes: { type: Number, min: 15, max: 600, default: 60 },
  companion: { type: String, enum: ["", "water", "melody"], default: "" },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 254 },
  salt: { type: String, required: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
