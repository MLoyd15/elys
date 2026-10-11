import cors from "cors";
import express from "express";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import flashcardRoutes from "./routes/flashcards.js";
import lessonRoutes from "./routes/lessons.js";
import noteRoutes from "./routes/notes.js";
import studyGuideRoutes from "./routes/studyGuides.js";
import studySessionRoutes from "./routes/studySessions.js";
import taskRoutes from "./routes/tasks.js";
import { requireSession } from "./middleware/requireSession.js";
import { errorHandler } from "./middleware/errorHandler.js";
import mongoose from "mongoose";

const app = express();

app.use(cors());
app.use(express.json({ limit: "4mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});
app.use("/api/auth", authRoutes);

app.use("/api", requireSession);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/study-guides", studyGuideRoutes);
app.use("/api/study-sessions", studySessionRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notes", noteRoutes);

if (existsSync(resolve("dist", "index.html"))) {
  app.use(express.static(resolve("dist")));
  app.get("*", (_request, response) => {
    response.sendFile(resolve("dist", "index.html"));
  });
}

app.use(errorHandler);

export default app;
