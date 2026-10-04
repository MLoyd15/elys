import { Router } from "express";
import { Task } from "../models/Task.js";

const router = Router();

function isValidDueDate(value) {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function serializeTask(task) {
  return {
    id: task._id.toString(),
    title: task.title,
    completed: task.completed,
    dueLabel: task.dueLabel,
    dueDate: task.dueDate || "",
  };
}

router.post("/", async (request, response, next) => {
  try {
    const title = typeof request.body?.title === "string" ? request.body.title.trim() : "";
    if (!title || title.length > 120) {
      return response.status(400).json({ error: "Task title must be between 1 and 120 characters." });
    }
    const dueDate = request.body?.dueDate ?? "";
    if (!isValidDueDate(dueDate)) {
      return response.status(400).json({ error: "Enter a valid task deadline." });
    }
    const task = await Task.create({ title, dueDate, dueLabel: dueDate ? "" : "No deadline" });
    response.status(201).json(serializeTask(task));
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (request, response, next) => {
  try {
    const hasCompletion = typeof request.body?.completed === "boolean";
    const hasDueDate = Object.hasOwn(request.body || {}, "dueDate");
    if (!hasCompletion && !hasDueDate) {
      return response.status(400).json({ error: "Provide a completion status or task deadline." });
    }
    if (hasDueDate && !isValidDueDate(request.body.dueDate)) {
      return response.status(400).json({ error: "Enter a valid task deadline." });
    }
    const updates = {};
    if (hasCompletion) updates.completed = request.body.completed;
    if (hasDueDate) {
      updates.dueDate = request.body.dueDate || "";
      updates.dueLabel = request.body.dueDate ? "" : "No deadline";
    }
    const task = await Task.findByIdAndUpdate(
      request.params.id,
      updates,
      { new: true, runValidators: true },
    );
    if (!task) return response.status(404).json({ error: "Task not found." });
    response.json(serializeTask(task));
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (request, response, next) => {
  try {
    const task = await Task.findByIdAndDelete(request.params.id);
    if (!task) return response.status(404).json({ error: "Task not found." });
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
