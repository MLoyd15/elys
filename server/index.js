import "dotenv/config";
import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { lessonCatalog } from "./catalog.js";
import { flashcardCatalog } from "./flashcards.js";
import { studyGuideCatalog } from "./studyGuides.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const sessionCookie = "nursepath_access";
const sessionDurationSeconds = 7 * 24 * 60 * 60;
const loginAttempts = new Map();

app.use(cors());
app.use(express.json({ limit: "256kb" }));

function safeEqual(left, right) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function sessionSignature(expiresAt) {
  return createHmac("sha256", process.env.SESSION_SECRET).update(expiresAt).digest("base64url");
}

function hasValidSession(request) {
  const cookie = request.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${sessionCookie}=`));
  if (!cookie) return false;

  const [expiresAt, signature] = decodeURIComponent(cookie.slice(sessionCookie.length + 1)).split(".");
  if (!expiresAt || !signature || Number(expiresAt) <= Date.now()) return false;
  return safeEqual(signature, sessionSignature(expiresAt));
}

function setSessionCookie(response, expiresAt) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `${sessionCookie}=${expiresAt}.${sessionSignature(expiresAt)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${sessionDurationSeconds}${secure}`,
  );
}

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

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    completed: { type: Boolean, default: false },
    dueLabel: { type: String, default: "Today" },
  },
  { timestamps: true },
);

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120, default: "Untitled note" },
    content: { type: String, maxlength: 50000, default: "" },
  },
  { timestamps: true },
);

const progressSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: "default" },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  completedLessons: [{ type: String }],
  completedStudyQuizzes: [{ type: String }],
  lastStudyDate: { type: String, default: "" },
  weeklyMinutes: { type: Number, default: 0 },
  weekStart: { type: String, default: "" },
});

const flashcardSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  topic: { type: String, required: true },
  source: { type: String, default: "General nursing review" },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  hint: { type: String, required: true },
});

const studyGuideSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  topic: { type: String, required: true },
  source: { type: String, required: true },
  readTime: { type: String, required: true },
  title: { type: String, required: true },
  introduction: { type: String, required: true },
  objectives: [{ type: String, required: true }],
  sections: [
    {
      title: { type: String, required: true },
      body: { type: String, required: true },
      bullets: [{ type: String, required: true }],
    },
  ],
  quiz: [
    {
      prompt: { type: String, required: true },
      options: [{ type: String, required: true }],
      answer: { type: Number, required: true },
      explanation: { type: String, required: true },
    },
  ],
  reflection: { type: String, required: true },
  safetyNote: { type: String, required: true },
});

const Lesson = mongoose.model("Lesson", lessonSchema);
const Task = mongoose.model("Task", taskSchema);
const Note = mongoose.model("Note", noteSchema);
const Progress = mongoose.model("Progress", progressSchema);
const Flashcard = mongoose.model("Flashcard", flashcardSchema);
const StudyGuide = mongoose.model("StudyGuide", studyGuideSchema);

async function initializeDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required. Copy .env.example to .env and set your MongoDB connection string.");
  }
  if (!process.env.ACCESS_CODE) {
    throw new Error("ACCESS_CODE is required. Set it in your local .env file.");
  }
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters. Set a random secret in your local .env file.");
  }

  await mongoose.connect(uri);
  await Promise.all(
    lessonCatalog.map((lesson) =>
      Lesson.updateOne({ slug: lesson.slug }, { $setOnInsert: lesson }, { upsert: true }),
    ),
  );
  await Promise.all(
    flashcardCatalog.map(({ source, topic, ...flashcard }) =>
      Flashcard.updateOne(
        { slug: flashcard.slug },
        {
          $setOnInsert: flashcard,
          $set: { topic, source: source || "General nursing review" },
        },
        { upsert: true },
      ),
    ),
  );
  await Promise.all(
    studyGuideCatalog.map((guide) =>
      StudyGuide.updateOne({ slug: guide.slug }, { $set: guide }, { upsert: true }),
    ),
  );
  const progressSeed = await Progress.updateOne(
    { key: "default" },
    { $setOnInsert: { key: "default" } },
    { upsert: true },
  );
  if (progressSeed.upsertedCount === 1) {
    await Task.insertMany([
      { title: "Review medication calculation notes", dueLabel: "Today" },
      { title: "Complete maternal-newborn practice questions", dueLabel: "Today" },
      { title: "Pack clinical placement essentials", dueLabel: "Tomorrow" },
    ]);
  }
}

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

app.post("/api/auth/unlock", (request, response) => {
  const now = Date.now();
  const attempt = loginAttempts.get(request.ip);
  if (attempt && attempt.resetAt <= now) loginAttempts.delete(request.ip);
  const currentAttempt = loginAttempts.get(request.ip);
  if (currentAttempt?.count >= 5) {
    return response.status(429).json({ error: "Too many attempts. Please wait 15 minutes and try again." });
  }

  const submittedCode = typeof request.body.accessCode === "string" ? request.body.accessCode : "";
  if (!safeEqual(submittedCode, process.env.ACCESS_CODE)) {
    const nextAttempt = currentAttempt || { count: 0, resetAt: now + 15 * 60 * 1000 };
    nextAttempt.count += 1;
    loginAttempts.set(request.ip, nextAttempt);
    return response.status(401).json({ error: "That access code doesn’t match. Try again." });
  }

  loginAttempts.delete(request.ip);
  const expiresAt = String(now + sessionDurationSeconds * 1000);
  setSessionCookie(response, expiresAt);
  response.json({ unlocked: true });
});

app.post("/api/auth/lock", (_request, response) => {
  response.setHeader(
    "Set-Cookie",
    `${sessionCookie}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
  response.status(204).end();
});

app.use("/api", (request, response, next) => {
  if (request.path === "/health" || request.path.startsWith("/auth/")) {
    return next();
  }
  if (!hasValidSession(request)) {
    return response.status(401).json({ error: "Enter the access code to continue." });
  }
  next();
});

app.get("/api/dashboard", async (_request, response, next) => {
  try {
    const [lessons, tasks, progress] = await Promise.all([
      Lesson.find().lean(),
      Task.find().sort({ completed: 1, createdAt: 1 }).lean(),
      Progress.findOne({ key: "default" }).lean(),
    ]);
    if (!progress) {
      throw new Error("Study progress is not initialized.");
    }
    response.json({
      lessons: lessons
        .sort((a, b) => lessonCatalog.findIndex((lesson) => lesson.slug === a.slug) - lessonCatalog.findIndex((lesson) => lesson.slug === b.slug))
        .map(({ slug, title, category, icon, color, duration, description }) => ({
        slug,
        title,
        category,
        icon,
        color,
        duration,
        description,
        completed: progress.completedLessons.includes(slug),
        })),
      tasks: tasks.map(({ _id, title, completed, dueLabel }) => ({
        id: _id.toString(),
        title,
        completed,
        dueLabel,
      })),
      progress: {
        xp: progress.xp,
        streak: progress.streak,
        completedCount: (progress.completedStudyQuizzes || []).length,
        completedStudyQuizzes: progress.completedStudyQuizzes || [],
        weeklyMinutes: progress.weeklyMinutes,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/lessons/:slug", async (request, response, next) => {
  try {
    const lesson = await Lesson.findOne({ slug: request.params.slug }).lean();
    if (!lesson) {
      return response.status(404).json({ error: "Lesson not found." });
    }
    response.json(lesson);
  } catch (error) {
    next(error);
  }
});

app.get("/api/flashcards", async (request, response, next) => {
  try {
    const filter = {};
    if (typeof request.query.topic === "string" && request.query.topic !== "All topics") {
      filter.topic = request.query.topic;
    }
    const cards = await Flashcard.find(filter).lean();
    cards.sort(
      (a, b) =>
        flashcardCatalog.findIndex((card) => card.slug === a.slug) -
        flashcardCatalog.findIndex((card) => card.slug === b.slug),
    );
    response.json(
      cards.map(({ slug, topic, source, question, answer, hint }) => ({
        slug,
        topic,
        source: source || "General nursing review",
        question,
        answer,
        hint,
      })),
    );
  } catch (error) {
    next(error);
  }
});

app.get("/api/study-guides", async (_request, response, next) => {
  try {
    const guides = await StudyGuide.find().lean();
    guides.sort(
      (a, b) =>
        studyGuideCatalog.findIndex((guide) => guide.slug === a.slug) -
        studyGuideCatalog.findIndex((guide) => guide.slug === b.slug),
    );
    response.json(
      guides.map(({ slug, topic, source, readTime, title, introduction, objectives, sections, reflection, safetyNote }) => ({
        slug,
        topic,
        source,
        readTime,
        title,
        introduction,
        objectives,
        sections: sections.map(({ title: sectionTitle, body, bullets }) => ({
          title: sectionTitle,
          body,
          bullets,
        })),
        reflection,
        safetyNote,
      })),
    );
  } catch (error) {
    next(error);
  }
});

app.get("/api/study-guides/:slug/quiz", async (request, response, next) => {
  try {
    const guide = await StudyGuide.findOne({ slug: request.params.slug }).lean();
    if (!guide) {
      return response.status(404).json({ error: "Study guide not found." });
    }
    response.json({
      kind: "study-guide",
      slug: guide.slug,
      title: `${guide.topic} quiz`,
      category: guide.topic,
      icon: "📘",
      color: "mint",
      duration: "10 questions",
      description: `Check your understanding of ${guide.topic}.`,
      questions: guide.quiz,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/study-guides/:slug/attempt", async (request, response, next) => {
  try {
    const guide = await StudyGuide.findOne({ slug: request.params.slug }).lean();
    if (!guide) {
      return response.status(404).json({ error: "Study guide not found." });
    }
    const { answers } = request.body;
    if (
      !Array.isArray(answers) ||
      answers.length !== guide.quiz.length ||
      answers.some(
        (answer, index) =>
          !Number.isInteger(answer) || answer < 0 || answer >= guide.quiz[index].options.length,
      )
    ) {
      return response.status(400).json({ error: "Submit one valid answer for every question." });
    }

    const correct = answers.reduce(
      (count, answer, index) => count + Number(answer === guide.quiz[index].answer),
      0,
    );
    const earnedXp = correct * 10 + (correct === guide.quiz.length ? 10 : 0);
    const today = new Date().toISOString().slice(0, 10);
    const date = new Date();
    const dayOfWeek = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() - dayOfWeek + 1);
    const weekStart = date.toISOString().slice(0, 10);
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const progress = await Progress.findOne({ key: "default" });
    if (!progress) {
      throw new Error("Study progress is not initialized.");
    }
    const isFirstCompletion = !progress.completedStudyQuizzes.includes(guide.slug);
    const awardedXp = isFirstCompletion ? earnedXp : Math.floor(earnedXp / 2);
    progress.xp += awardedXp;
    if (isFirstCompletion) {
      progress.completedStudyQuizzes.push(guide.slug);
    }
    if (progress.lastStudyDate !== today) {
      progress.streak = progress.lastStudyDate === yesterdayDate ? progress.streak + 1 : 1;
      progress.lastStudyDate = today;
    }
    if (progress.weekStart !== weekStart) {
      progress.weeklyMinutes = 0;
      progress.weekStart = weekStart;
    }
    progress.weeklyMinutes += Number.parseInt(guide.readTime, 10) || 0;
    await progress.save();

    response.json({
      correct,
      total: guide.quiz.length,
      earnedXp: awardedXp,
      completed: isFirstCompletion,
      xp: progress.xp,
      streak: progress.streak,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/lessons/:slug/attempt", async (request, response, next) => {
  try {
    const lesson = await Lesson.findOne({ slug: request.params.slug });
    if (!lesson) {
      return response.status(404).json({ error: "Lesson not found." });
    }
    const { answers } = request.body;
    if (
      !Array.isArray(answers) ||
      answers.length !== lesson.questions.length ||
      answers.some(
        (answer, index) =>
          !Number.isInteger(answer) || answer < 0 || answer >= lesson.questions[index].options.length,
      )
    ) {
      return response.status(400).json({ error: "Submit one valid answer for every question." });
    }

    const correct = answers.reduce(
      (count, answer, index) => count + Number(answer === lesson.questions[index].answer),
      0,
    );
    const earnedXp = correct * 10 + (correct === lesson.questions.length ? 10 : 0);
    const today = new Date().toISOString().slice(0, 10);
    const date = new Date();
    const dayOfWeek = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() - dayOfWeek + 1);
    const weekStart = date.toISOString().slice(0, 10);
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const progress = await Progress.findOne({ key: "default" });
    const isFirstCompletion = !progress.completedLessons.includes(lesson.slug);
    progress.xp += isFirstCompletion ? earnedXp : Math.floor(earnedXp / 2);
    if (isFirstCompletion) {
      progress.completedLessons.push(lesson.slug);
    }
    if (progress.lastStudyDate !== today) {
      progress.streak = progress.lastStudyDate === yesterdayDate ? progress.streak + 1 : 1;
      progress.lastStudyDate = today;
    }
    if (progress.weekStart !== weekStart) {
      progress.weeklyMinutes = 0;
      progress.weekStart = weekStart;
    }
    progress.weeklyMinutes += Number.parseInt(lesson.duration, 10) || 0;
    await progress.save();

    response.json({
      correct,
      total: lesson.questions.length,
      earnedXp: isFirstCompletion ? earnedXp : Math.floor(earnedXp / 2),
      completed: isFirstCompletion,
      xp: progress.xp,
      streak: progress.streak,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/tasks", async (request, response, next) => {
  try {
    const title = typeof request.body.title === "string" ? request.body.title.trim() : "";
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

app.patch("/api/tasks/:id", async (request, response, next) => {
  try {
    if (typeof request.body.completed !== "boolean") {
      return response.status(400).json({ error: "A completed boolean is required." });
    }
    const task = await Task.findByIdAndUpdate(
      request.params.id,
      { completed: request.body.completed },
      { new: true, runValidators: true },
    );
    if (!task) {
      return response.status(404).json({ error: "Task not found." });
    }
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

app.delete("/api/tasks/:id", async (request, response, next) => {
  try {
    const task = await Task.findByIdAndDelete(request.params.id);
    if (!task) {
      return response.status(404).json({ error: "Task not found." });
    }
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

function serializeNote(note) {
  return {
    id: note._id.toString(),
    title: note.title,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

app.get("/api/notes", async (_request, response, next) => {
  try {
    const notes = await Note.find().sort({ updatedAt: -1, createdAt: -1 }).lean();
    response.json(notes.map(serializeNote));
  } catch (error) {
    next(error);
  }
});

app.post("/api/notes", async (_request, response, next) => {
  try {
    const note = await Note.create({});
    response.status(201).json(serializeNote(note));
  } catch (error) {
    next(error);
  }
});

app.patch("/api/notes/:id", async (request, response, next) => {
  try {
    const title = typeof request.body.title === "string" ? request.body.title.trim() : "";
    const { content } = request.body;
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
    if (!note) {
      return response.status(404).json({ error: "Note not found." });
    }
    response.json(serializeNote(note));
  } catch (error) {
    next(error);
  }
});

app.delete("/api/notes/:id", async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(400).json({ error: "Invalid note ID." });
    }
    const note = await Note.findByIdAndDelete(request.params.id);
    if (!note) {
      return response.status(404).json({ error: "Note not found." });
    }
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

if (existsSync(resolve("dist", "index.html"))) {
  app.use(express.static(resolve("dist")));
  app.get("*", (_request, response) => {
    response.sendFile(resolve("dist", "index.html"));
  });
}

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "Something went wrong. Please try again." });
});

initializeDatabase()
  .then(() => {
    app.listen(port, () => console.log(`NursePath API listening on http://localhost:${port}`));
  })
  .catch((error) => {
    console.error(`Database startup failed: ${error.message}`);
    process.exitCode = 1;
  });
