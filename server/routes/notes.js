import mongoose from "mongoose";
import { Router } from "express";
import { Note } from "../models/Note.js";

const router = Router();

function serializeNote(note) {
  return {
    id: note._id.toString(),
    title: note.title,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

router.get("/", async (_request, response, next) => {
  try {
    const notes = await Note.find().sort({ updatedAt: -1, createdAt: -1 }).lean();
    response.json(notes.map(serializeNote));
  } catch (error) {
    next(error);
  }
});

router.post("/", async (_request, response, next) => {
  try {
    const note = await Note.create({});
    response.status(201).json(serializeNote(note));
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (request, response, next) => {
  try {
    const title = typeof request.body?.title === "string" ? request.body.title.trim() : "";
    const content = request.body?.content;
    if (!title || title.length > 120 || typeof content !== "string" || content.length > 50000) {
      return response.status(400).json({ error: "A note needs a title of 1–120 characters and content up to 50,000 characters." });
    }
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(400).json({ error: "Invalid note ID." });
    }
    const note = await Note.findByIdAndUpdate(
      request.params.id,
      { title, content },
      { new: true, runValidators: true },
    );
    if (!note) return response.status(404).json({ error: "Note not found." });
    response.json(serializeNote(note));
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(400).json({ error: "Invalid note ID." });
    }
    const note = await Note.findByIdAndDelete(request.params.id);
    if (!note) return response.status(404).json({ error: "Note not found." });
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
