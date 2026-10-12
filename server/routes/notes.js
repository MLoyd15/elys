import mongoose from "mongoose";
import { Router } from "express";
import { Note } from "../models/Note.js";
import { NoteFolder } from "../models/NoteFolder.js";

const router = Router();

function serializeNote(note) {
  return {
    id: note._id.toString(),
    title: note.title,
    content: note.content,
    folderId: note.folderId?.toString() || null,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

function serializeFolder(folder) {
  return {
    id: folder._id.toString(),
    name: folder.name,
  };
}

async function validFolderId(folderId, userId) {
  if (folderId === null || folderId === "") return true;
  if (typeof folderId !== "string" || !mongoose.isValidObjectId(folderId)) return false;
  return Boolean(await NoteFolder.exists({ _id: folderId, userId }));
}

router.get("/folders", async (request, response, next) => {
  try {
    const folders = await NoteFolder.find({ userId: request.userId }).sort({ name: 1 }).lean();
    response.json(folders.map(serializeFolder));
  } catch (error) {
    next(error);
  }
});

router.post("/folders", async (request, response, next) => {
  try {
    const name = typeof request.body?.name === "string" ? request.body.name.trim() : "";
    if (!name || name.length > 60) {
      return response.status(400).json({ error: "A folder name must be 1–60 characters." });
    }
    const existingFolder = await NoteFolder.findOne({ name, userId: request.userId }).collation({ locale: "en", strength: 2 });
    if (existingFolder) return response.status(409).json({ error: "A folder with that name already exists." });
    const folder = await NoteFolder.create({ name, userId: request.userId });
    response.status(201).json(serializeFolder(folder));
  } catch (error) {
    if (error.code === 11000) return response.status(409).json({ error: "A folder with that name already exists." });
    next(error);
  }
});

router.get("/", async (request, response, next) => {
  try {
    const notes = await Note.find({ userId: request.userId }).sort({ updatedAt: -1, createdAt: -1 }).lean();
    response.json(notes.map(serializeNote));
  } catch (error) {
    next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const folderId = request.body?.folderId ?? null;
    if (!await validFolderId(folderId, request.userId)) {
      return response.status(400).json({ error: "Choose a valid folder." });
    }
    const note = await Note.create({ folderId: folderId || null, userId: request.userId });
    response.status(201).json(serializeNote(note));
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (request, response, next) => {
  try {
    const title = typeof request.body?.title === "string" ? request.body.title.trim() : "";
    const content = request.body?.content;
    const folderId = request.body?.folderId;
    if (!title || title.length > 120 || typeof content !== "string" || content.length > 50000) {
      return response.status(400).json({ error: "A note needs a title of 1–120 characters and content up to 50,000 characters." });
    }
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(400).json({ error: "Invalid note ID." });
    }
    if (folderId !== undefined && !await validFolderId(folderId, request.userId)) {
      return response.status(400).json({ error: "Choose a valid folder." });
    }
    const updates = { title, content };
    if (folderId !== undefined) updates.folderId = folderId || null;
    const note = await Note.findOneAndUpdate({ _id: request.params.id, userId: request.userId },
      updates,
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
    const note = await Note.findOneAndDelete({ _id: request.params.id, userId: request.userId });
    if (!note) return response.status(404).json({ error: "Note not found." });
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
