# Nurselys

A gamified nursing study companion for a fourth-year nursing student. Nurselys combines short practice lessons, flashcards, XP and streak tracking, study progress, and a MongoDB-backed to-do list.

## Requirements

- Node.js 20.16 or newer
- MongoDB running locally or a MongoDB connection string

## Run locally

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env`, set `MONGODB_URI` to your MongoDB connection string, and choose a private `ACCESS_CODE`. Set `SESSION_SECRET` to a random secret of at least 32 characters; do not commit `.env`.
3. To generate study materials from uploaded PDFs, create a Gemini API key in [Google AI Studio](https://aistudio.google.com/app/apikey) and set `GEMINI_API_KEY` in the server environment. Keep the key private; never put it in frontend code or commit it. `GEMINI_MODEL` defaults to `gemini-3.1-flash-lite`. Optionally set `GEMINI_FALLBACK_MODEL` to a second model ID to try if the primary model is unavailable or rate-limited.

4. Start the API and React development server:

   ```sh
   npm run dev
   ```

5. Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

The API runs on port 4000. On first connection, it inserts the sample lessons, a study progress record, and starter to-dos if the database is empty. AI Guide accepts a PDF of up to 30 pages or pasted text, with a 10,000-character maximum for extracted or pasted text. PDF text is extracted in the browser and sent to Gemini; pasted text is sent directly to Gemini. Generated study guides, 12 flashcards, and 10-question quizzes are saved in MongoDB and shared with app users. Scanned/image-only PDFs require OCR and are not supported. Do not upload confidential documents or patient identifiers.

## Production build

```sh
npm run build
npm start
```

The Express server serves the built React app and API on port 4000.

## Deploy

Nurselys can be deployed with the Vercel frontend, a Render Node.js API, and MongoDB Atlas. The Vercel `/api/*` function proxies requests to Render so the access-session cookie stays first-party on the website domain.

1. Create a MongoDB Atlas database and copy its connection string. Keep the database password private.
2. Push this project to a GitHub repository you control. Do not add `.env` or deployment secrets to Git.
3. In Render, create a Blueprint from the repository and use `render.yaml`. Set `MONGODB_URI` to the Atlas connection string and `ACCESS_CODE` to the private code you want Elys to use. Render generates `SESSION_SECRET`.
4. In the Render service environment, set `GEMINI_API_KEY` to the key created in Google AI Studio. Optionally set `GEMINI_MODEL`; otherwise the API uses `gemini-3.1-flash-lite`. You can also set `GEMINI_FALLBACK_MODEL` to another available Gemini model ID. Do not put the key in Vercel or any client-side setting.
5. Once the Render service is live, copy its base URL (for example, `https://nursepath-api.onrender.com`).
6. Import the same repository into Vercel with the project root as the root directory. Set the `API_URL` environment variable to the Render service's base URL, with no `/api` suffix. Deploy.
7. Open the Vercel website URL and test unlocking, quizzes, tasks, notes, and AI Guide using both a PDF and pasted text.

The Render free plan may sleep while idle, so the first request after a quiet period can take longer. Hosting providers may change their free-plan limits.

## Frontend structure

- `client/src/App.jsx` manages application state, navigation, and API actions.
- `client/src/components/` contains the dashboard pages, notepad, task form, and practice modals.
- `client/src/api.js` provides the shared API request helper.
- `client/src/styles.css` imports the ordered, feature-focused stylesheets from `client/src/styles/`.

## Backend structure

- `server/index.js` loads environment variables, connects to MongoDB, and starts the HTTP server.
- `server/app.js` configures Express middleware, API routes, and static frontend serving.
- `server/config/db.js` connects to MongoDB and seeds the lesson, flashcard, study-guide, and progress collections.
- `server/models/` defines one Mongoose model per data schema.
- `server/routes/` contains the auth, dashboard, lesson, flashcard, study-guide, task, and note endpoints.
- `server/services/` contains Gemini generation and validation, plus shared quiz progress updates.
- `server/middleware/` contains session enforcement and centralized error handling.
- `server/utils/session.js` provides shared session-cookie and signature helpers.

## Included

- Statistics-only Overview with CCN quiz completion, XP, weekly study time, streak, and per-unit review progress; learning path, quick quizzes, Study Room, flashcards, to-dos, and detailed progress are separate sidebar destinations
- A matching 10-question multiple-choice quiz for each of the six CCN Study Room units, with answer explanations and consistent launch/scoring from the dashboard or Study Room
- A dedicated CCN Study Room with readable, source-labeled notes, learning objectives, reflection prompts, and clinical reminders for each course unit
- 73 flashcards, including 57 paraphrased CCN prelims cards across all six course units, with topic filters, flip-to-reveal answers, and session recall tracking
- Server-checked quiz scores, XP, completed lessons, study time, and daily streak tracking
- MongoDB-backed to-do list with optional deadlines, overdue indicators, add, complete, and delete actions
- Personal Notepad page with MongoDB-backed notes, user-created folders, and note filing
- Browser-based PDF text extraction with local file processing
- Server-validated shared access code with an HttpOnly, signed session cookie
- Responsive layout for desktop and mobile

Study questions are for educational review and are not a substitute for clinical judgment, facility policy, or current clinical guidance.
CCN cards are paraphrased study aids based on the user-provided review notes. Potentially unsafe or time-sensitive advice in the notes is omitted or reframed; confirm clinical details against current course materials, official guidance, and facility policy.
