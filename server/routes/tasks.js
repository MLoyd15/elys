import { Router } from "express";
import { Task } from "../models/Task.js";

const router = Router();

router.post("/", async (request, response, next) => {
  try {
    const title = typeof request.body?.title === "string" ? request.body.title.trim() : "";
    if (!title || title.length > 120) {
      return response.status(400).json({ error: "Task title must be between 1 and 120 characters." });
    }
    const task = await Task.create({ title });
    response.status(201).json({
      id: task._id.toString(),
      title: task.title,
      completed: task.completed,
      dueLabel: task.dueLabel,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (request, response, next) => {
  try {
    if (typeof request.body?.completed !== "boolean") {
      return response.status(400).json({ error: "A completed boolean is required." });
    }
    const task = await Task.findByIdAndUpdate(
      request.params.id,
      { completed: request.body.completed },
      { new: true, runValidators: true },
    );
    if (!task) return response.status(404).json({ error: "Task not found." });
    response.json({
      id: task._id.toString(),
      title: task.title,
      completed: task.completed,
      dueLabel: task.dueLabel,
    });
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
