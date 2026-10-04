import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    completed: { type: Boolean, default: false },
    dueLabel: { type: String, default: "Today" },
    dueDate: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

export const Task = mongoose.model("Task", taskSchema);
