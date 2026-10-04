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

3. Start the API and React development server:

   ```sh
   npm run dev
   ```

4. Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

The API runs on port 4000. On first connection, it inserts the sample lessons, a study progress record, and starter to-dos if the database is empty.

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
4. Once the Render service is live, copy its base URL (for example, `https://nursepath-api.onrender.com`).
5. Import the same repository into Vercel with the project root as the root directory. Set the `API_URL` environment variable to the Render service's base URL, with no `/api` suffix. Deploy.
6. Open the Vercel website URL and test unlocking, quizzes, tasks, and notes.

The Render free plan may sleep while idle, so the first request after a quiet period can take longer. Hosting providers may change their free-plan limits.

## Frontend structure

- `client/src/App.jsx` manages application state, navigation, and API actions.
- `client/src/components/` contains the dashboard pages, notepad, task form, and practice modals.
- `client/src/api.js` provides the shared API request helper.
- `client/src/styles.css` imports the ordered, feature-focused stylesheets from `client/src/styles/`.

## Included

- Statistics-only Overview with CCN quiz completion, XP, weekly study time, streak, and per-unit review progress; learning path, quick quizzes, Study Room, flashcards, to-dos, and detailed progress are separate sidebar destinations
- A matching 10-question multiple-choice quiz for each of the six CCN Study Room units, with answer explanations and consistent launch/scoring from the dashboard or Study Room
- A dedicated CCN Study Room with readable, source-labeled notes, learning objectives, reflection prompts, and clinical reminders for each course unit
- 73 flashcards, including 57 paraphrased CCN prelims cards across all six course units, with topic filters, flip-to-reveal answers, and session recall tracking
- Server-checked quiz scores, XP, completed lessons, study time, and daily streak tracking
- MongoDB-backed to-do list with add, complete, and delete actions
- Personal Notepad page with MongoDB-backed create, edit, save, and delete for study notes
- Browser-based PDF text extraction with local file processing
- Server-validated shared access code with an HttpOnly, signed session cookie
- Responsive layout for desktop and mobile

Study questions are for educational review and are not a substitute for clinical judgment, facility policy, or current clinical guidance.
CCN cards are paraphrased study aids based on the user-provided review notes. Potentially unsafe or time-sensitive advice in the notes is omitted or reframed; confirm clinical details against current course materials, official guidance, and facility policy.
