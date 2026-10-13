import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { Router } from "express";
import { Flashcard } from "../models/Flashcard.js";
import { Note } from "../models/Note.js";
import { NoteFolder } from "../models/NoteFolder.js";
import { Progress } from "../models/Progress.js";
import { StudyGuide } from "../models/StudyGuide.js";
import { StudySession } from "../models/StudySession.js";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { flashcardCatalog } from "../flashcards.js";
import { studyGuideCatalog } from "../studyGuides.js";
import { clearSessionCookie, getSessionUserId, setSessionCookie } from "../utils/session.js";

const router = Router();
const scrypt = promisify(scryptCallback);
const loginAttempts = new Map();
const starterTasks = [
  { title: "Review medication calculation notes", dueLabel: "Today" },
  { title: "Complete maternal-newborn practice questions", dueLabel: "Today" },
  { title: "Pack clinical placement essentials", dueLabel: "Tomorrow" },
];

function publicUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email, yearLevel: user.yearLevel || "", examDate: user.examDate || "", dailyGoalMinutes: user.dailyGoalMinutes || 60, companion: user.companion || "", theme: user.theme || "water" };
}

async function passwordDigest(password, salt) {
  return scrypt(password, salt, 64);
}

async function claimLegacyData(userId) {
  const ownerId = userId;
  await Promise.all([
    Task.updateMany({ userId: { $exists: false } }, { $set: { userId: ownerId } }),
    Note.updateMany({ userId: { $exists: false } }, { $set: { userId: ownerId } }),
    NoteFolder.updateMany({ userId: { $exists: false } }, { $set: { userId: ownerId } }),
    StudySession.updateMany({ userId: { $exists: false } }, { $set: { userId: ownerId } }),
    Progress.updateMany({ userId: { $exists: false } }, { $set: { userId: ownerId, key: ownerId.toString() } }),
    StudyGuide.updateMany(
      { userId: { $exists: false }, slug: { $nin: studyGuideCatalog.map((guide) => guide.slug) } },
      { $set: { userId: ownerId } },
    ),
    Flashcard.updateMany(
      { userId: { $exists: false }, slug: { $nin: flashcardCatalog.map((card) => card.slug) } },
      { $set: { userId: ownerId } },
    ),
  ]);
}

async function establishUserSession(user, response) {
  setSessionCookie(response, user._id.toString());
  let progress = await Progress.findOne({ userId: user._id });
  if (!progress) {
    progress = await Progress.create({
      key: user._id.toString(),
      userId: user._id,
      completedLessons: [],
      completedStudyQuizzes: [],
    });
  }
  if (!await Task.exists({ userId: user._id })) {
    await Task.insertMany(starterTasks.map((task) => ({ ...task, userId: user._id })));
  }
  return response.json({ user: publicUser(user) });
}

router.post("/register", async (request, response, next) => {
  try {
    const name = typeof request.body?.name === "string" ? request.body.name.trim() : "";
    const email = typeof request.body?.email === "string" ? request.body.email.trim().toLowerCase() : "";
    const password = typeof request.body?.password === "string" ? request.body.password : "";
    if (name.length < 2 || name.length > 60) {
      return response.status(400).json({ error: "Name must be between 2 and 60 characters." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return response.status(400).json({ error: "Enter a valid email address." });
    }
    if (password.length < 8 || password.length > 128) {
      return response.status(400).json({ error: "Password must be between 8 and 128 characters." });
    }
    const salt = randomBytes(16).toString("hex");
    const passwordHash = (await passwordDigest(password, salt)).toString("hex");
    const user = await User.create({ name, email, salt, passwordHash });
    if (await User.countDocuments() === 1) await claimLegacyData(user._id);
    await establishUserSession(user, response);
  } catch (error) {
    if (error.code === 11000) return response.status(409).json({ error: "An account with this email already exists." });
    next(error);
  }
});

router.post("/login", async (request, response, next) => {
  try {
    const now = Date.now();
    const attempt = loginAttempts.get(request.ip);
    if (attempt && attempt.resetAt <= now) loginAttempts.delete(request.ip);
    const current = loginAttempts.get(request.ip);
    if (current?.count >= 8) {
      return response.status(429).json({ error: "Too many login attempts. Wait 15 minutes and try again." });
    }
    const email = typeof request.body?.email === "string" ? request.body.email.trim().toLowerCase() : "";
    const password = typeof request.body?.password === "string" ? request.body.password : "";
    const user = await User.findOne({ email });
    const submittedHash = user ? await passwordDigest(password, user.salt) : Buffer.alloc(64);
    const storedHash = user ? Buffer.from(user.passwordHash, "hex") : Buffer.alloc(64);
    if (!user || submittedHash.length !== storedHash.length || !timingSafeEqual(submittedHash, storedHash)) {
      const nextAttempt = current || { count: 0, resetAt: now + 15 * 60 * 1000 };
      nextAttempt.count += 1;
      loginAttempts.set(request.ip, nextAttempt);
      return response.status(401).json({ error: "Email or password is incorrect." });
    }
    loginAttempts.delete(request.ip);
    await establishUserSession(user, response);
  } catch (error) {
    next(error);
  }
});

router.get("/me", async (request, response, next) => {
  try {
    const userId = getSessionUserId(request);
    const user = userId ? await User.findById(userId) : null;
    if (!user) return response.status(401).json({ error: "Log in to continue." });
    response.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.patch("/profile", async (request, response, next) => {
  try {
    const userId = getSessionUserId(request);
    if (!userId) return response.status(401).json({ error: "Log in to update your profile." });
    const body = request.body || {};
    const updates = {};
    if (Object.prototype.hasOwnProperty.call(body, "name")) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (name.length < 2 || name.length > 60) return response.status(400).json({ error: "Display name must be between 2 and 60 characters." });
      updates.name = name;
    }
    if (Object.prototype.hasOwnProperty.call(body, "yearLevel")) {
      const yearLevel = typeof body.yearLevel === "string" ? body.yearLevel.trim() : "";
      if (yearLevel.length > 50) return response.status(400).json({ error: "Year level must be 50 characters or fewer." });
      updates.yearLevel = yearLevel;
    }
    if (Object.prototype.hasOwnProperty.call(body, "examDate")) {
      const examDate = typeof body.examDate === "string" ? body.examDate.trim() : "";
      if (examDate) {
        const parsedDate = new Date(`${examDate}T00:00:00.000Z`);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(examDate) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== examDate) {
          return response.status(400).json({ error: "Enter a valid exam date." });
        }
      }
      updates.examDate = examDate;
    }
    if (Object.prototype.hasOwnProperty.call(body, "dailyGoalMinutes")) {
      const dailyGoalMinutes = Number(body.dailyGoalMinutes);
      if (!Number.isInteger(dailyGoalMinutes) || dailyGoalMinutes < 15 || dailyGoalMinutes > 600) {
        return response.status(400).json({ error: "Daily study goal must be between 15 and 600 minutes." });
      }
      updates.dailyGoalMinutes = dailyGoalMinutes;
    }
    if (Object.prototype.hasOwnProperty.call(body, "companion")) {
      const companion = typeof body.companion === "string" ? body.companion.trim().toLowerCase() : "";
      if (!["water", "melody", "fox"].includes(companion)) return response.status(400).json({ error: "Choose a valid study companion." });
      updates.companion = companion;
    }
    if (Object.prototype.hasOwnProperty.call(body, "theme")) {
      const theme = typeof body.theme === "string" ? body.theme.trim().toLowerCase() : "";
      if (!["water", "melody", "fox"].includes(theme)) return response.status(400).json({ error: "Choose a valid companion theme." });
      updates.theme = theme;
    }
    if (Object.keys(updates).length === 0) return response.status(400).json({ error: "Choose a profile setting to update." });
    let updatedUser;
    if (updates.companion) {
      updatedUser = await User.findOneAndUpdate(
        { _id: userId, $or: [{ companion: "" }, { companion: { $exists: false } }, { companion: updates.companion }] },
        { $set: updates },
        { new: true, runValidators: true },
      );
      if (!updatedUser) {
        const existingUser = await User.findById(userId).select("companion").lean();
        if (!existingUser) return response.status(401).json({ error: "Log in to update your profile." });
        return response.status(409).json({ error: "Your study companion is a one-time choice and cannot be changed." });
      }
    } else {
      updatedUser = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
      if (!updatedUser) return response.status(401).json({ error: "Log in to update your profile." });
    }
    response.json({ user: publicUser(updatedUser) });
  } catch (error) {
    next(error);
  }
});
router.post("/logout", (_request, response) => {
  clearSessionCookie(response);
  response.status(204).end();
});

router.post("/lock", (_request, response) => {
  clearSessionCookie(response);
  response.status(204).end();
});

export default router;
