import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "./api.js";
import DashboardPages from "./components/DashboardPages.jsx";
import FlashcardModal from "./components/FlashcardModal.jsx";
import QuizModal from "./components/QuizModal.jsx";
import { Icon } from "./icons.jsx";
import StudyRoom from "./StudyRoom.jsx";

function App() {
  const [dashboard, setDashboard] = useState(null);
  const [activeNav, setActiveNav] = useState("home");
  const [activeLesson, setActiveLesson] = useState(null);
  const [flashcardsOpen, setFlashcardsOpen] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [flashcardTopic, setFlashcardTopic] = useState("All topics");
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [flashcardsError, setFlashcardsError] = useState("");
  const [studyRoomInitialSlug, setStudyRoomInitialSlug] = useState("");
  const [studyGuides, setStudyGuides] = useState([]);
  const [studyGuidesLoading, setStudyGuidesLoading] = useState(false);
  const [studyGuidesError, setStudyGuidesError] = useState("");
  const [reviewedGuideSlugs, setReviewedGuideSlugs] = useState([]);
  const studyGuidesRequestStarted = useRef(false);
  const [notice, setNotice] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [accessError, setAccessError] = useState("");
  const [accessLocked, setAccessLocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setDashboard(await api("/dashboard"));
    } catch (loadError) {
      if (loadError.status === 401) {
        setAccessLocked(true);
        setError("");
      } else {
        setError(loadError.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const loadStudyGuides = useCallback(async () => {
    setStudyGuidesLoading(true);
    setStudyGuidesError("");
    try {
      setStudyGuides(await api("/study-guides"));
    } catch (loadError) {
      setStudyGuidesError(loadError.message);
    } finally {
      setStudyGuidesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (dashboard && !studyGuidesRequestStarted.current) {
      studyGuidesRequestStarted.current = true;
      loadStudyGuides();
    }
  }, [dashboard, loadStudyGuides]);

  const todayLabel = useMemo(
    () => new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase(),
    [],
  );

  async function addTask(title, dueDate) {
    const task = await api("/tasks", { method: "POST", body: JSON.stringify({ title, dueDate }) });
    setDashboard((current) => ({ ...current, tasks: [task, ...current.tasks] }));
  }

  async function toggleTask(task) {
    try {
      const updated = await api(`/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !task.completed }),
      });
      setDashboard((current) => ({
        ...current,
        tasks: current.tasks.map((item) => (item.id === updated.id ? updated : item)),
      }));
    } catch (taskError) {
      setNotice(taskError.message);
    }
  }

  async function removeTask(taskId) {
    try {
      await api(`/tasks/${taskId}`, { method: "DELETE" });
      setDashboard((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== taskId) }));
    } catch (taskError) {
      setNotice(taskError.message);
    }
  }

  async function submitLesson(lesson, answers) {
    const endpoint = lesson.kind === "study-guide"
      ? `/study-guides/${lesson.slug}/attempt`
      : `/lessons/${lesson.slug}/attempt`;
    const result = await api(endpoint, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
    await loadDashboard();
    return result;
  }

  async function startStudyGuideQuiz(slug) {
    setActiveNav("quiz");
    try {
      setActiveLesson(await api(`/study-guides/${slug}/quiz`));
    } catch (quizError) {
      setNotice(quizError.message);
    }
  }

  async function openFlashcards(topic = "All topics", studyGuideSlug = "") {
    setActiveNav("cards");
    setFlashcardTopic(topic);
    setFlashcardsOpen(true);
    setFlashcardsLoading(true);
    setFlashcardsError("");
    try {
      const studyGuideFilter = studyGuideSlug ? `?studyGuide=${encodeURIComponent(studyGuideSlug)}` : "";
      setFlashcards(await api(`/flashcards${studyGuideFilter}`));
    } catch (loadError) {
      setFlashcardsError(loadError.message);
    } finally {
      setFlashcardsLoading(false);
    }
  }

  function openStudyRoom(initialSlug = "") {
    setActiveNav("study");
    setStudyRoomInitialSlug(initialSlug);
    if (studyGuides.length === 0 && !studyGuidesLoading) {
      loadStudyGuides();
    }
  }

  function openGeneratedStudyGuide(guide) {
    setStudyGuides((current) => [guide, ...current.filter((item) => item.slug !== guide.slug)]);
    setStudyRoomInitialSlug(guide.slug);
    setActiveNav("study");
  }

  async function unlockSite(event) {
    event.preventDefault();
    if (!accessCode) return;
    setUnlocking(true);
    setAccessError("");
    try {
      await api("/auth/unlock", {
        method: "POST",
        body: JSON.stringify({ accessCode }),
      });
      setAccessLocked(false);
      setAccessCode("");
      await loadDashboard();
    } catch (unlockError) {
      setAccessError(unlockError.message);
    } finally {
      setUnlocking(false);
    }
  }

  async function lockSite() {
    try {
      await api("/auth/lock", { method: "POST" });
      setAccessLocked(true);
      setDashboard(null);
      setActiveNav("home");
    } catch (lockError) {
      setNotice(lockError.message);
    }
  }

  if (loading && !dashboard && !accessLocked) {
    return <div className="loading-screen"><span className="loader" /><span>Getting your study space ready…</span></div>;
  }

  if (accessLocked) {
    return (
      <main className="access-screen">
        <form className="access-card" onSubmit={unlockSite}>
          <a className="brand access-brand" href="#" onClick={(event) => event.preventDefault()}>
            <span className="brand-mark">n<span>+</span></span>
            <span className="brand-name">nurse<span>lys</span></span>
          </a>
          <div className="access-illustration" aria-hidden="true">🔐</div>
          <div className="section-kicker">Hulaan mo ano password</div>
          <h1>Welcome, Elys.</h1>
          <p>Enter your access code to open your study space.</p>
          <label className="access-label" htmlFor="access-code">ACCESS CODE</label>
          <input
            id="access-code"
            className="access-input"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={accessCode}
            onChange={(event) => setAccessCode(event.target.value)}
            placeholder="Your special code"
            aria-describedby={accessError ? "access-error" : undefined}
          />
          {accessError && <span className="access-error" id="access-error" role="alert">{accessError}</span>}
          <button className="button button-primary access-submit" type="submit" disabled={!accessCode || unlocking}>
            {unlocking ? "Unlocking…" : "Open my study space"} {!unlocking && <Icon name="arrow" size={17} />}
          </button>
          <span className="access-footnote">Your study journey starts here <span>✳</span></span>
        </form>
      </main>
    );
  }

  if (loading && !dashboard) {
    return <div className="loading-screen"><span className="loader" /><span>Getting your study space ready…</span></div>;
  }

  if (error && !dashboard) {
    return (
      <div className="error-screen">
        <div className="error-card">
          <span className="error-icon">🩺</span>
          <h1>We couldn’t reach your study space</h1>
          <p>{error}</p>
          <p className="error-hint">Make sure MongoDB is running and your <code>MONGODB_URI</code> is set in <code>.env</code>.</p>
          <button className="button button-primary" onClick={loadDashboard}>Try again <Icon name="arrow" size={17} /></button>
        </div>
      </div>
    );
  }

  const { tasks, progress } = dashboard;
  const unfinishedTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.length - unfinishedTasks.length;
  const reviewedGuideCount = studyGuides.filter((guide) => reviewedGuideSlugs.includes(guide.slug)).length;
  const completedStudyQuizzes = progress.completedStudyQuizzes || [];
  const completedReviewCount = completedStudyQuizzes.length;
  const reviewPathLength = studyGuides.length || 6;
  const reviewCompletionPercent = Math.round((completedReviewCount / reviewPathLength) * 100);
  const nextGuideSlug = studyGuides.find((guide) => !reviewedGuideSlugs.includes(guide.slug))?.slug;
  const pageLabels = {
    home: "Overview",
    path: "Learning path",
    quiz: "Quick quizzes",
    study: "Study room",
    cards: "Flashcards",
    check: "My to-dos",
    notes: "Notepad",
    pdf: "AI Guide",
    chart: "Progress",
  };
  const pageDescriptions = {
    path: "Choose a study unit to open its reading guide, flashcards, and quiz.",
    quiz: "Practice with the same unit quizzes available in the Study Room.",
    check: "Keep track of your study tasks and plans.",
    notes: "Write down your own study notes and keep them in one place.",
    pdf: "Create a study guide, flashcards, and a quiz from a PDF or pasted text.",
    chart: "See how your completed study-unit quizzes add up.",
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark">n<span>+</span></span>
          <span className="brand-name">nurse<span>lys</span></span>
        </a>
        <div className="nav-label">YOUR SPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {[
            { key: "home", icon: "home", label: "Overview" },
            { key: "path", icon: "book", label: "Learning path" },
            { key: "quiz", icon: "check", label: "Quick quizzes" },
            { key: "study", icon: "book", label: "Study room" },
            { key: "cards", icon: "cards", label: "Flashcards" },
            { key: "check", icon: "check", label: "My to-dos" },
            { key: "notes", icon: "note", label: "Notepad" },
            { key: "pdf", icon: "fileText", label: "AI Guide" },
            { key: "chart", icon: "chart", label: "Progress" },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              className={`nav-item ${activeNav === key ? "active" : ""}`}
              onClick={() => {
                if (key === "cards") {
                  openFlashcards();
                  return;
                }
                if (key === "study") {
                  openStudyRoom();
                  return;
                }
                if (key === "quiz" && !studyGuidesRequestStarted.current) {
                  studyGuidesRequestStarted.current = true;
                  loadStudyGuides();
                }
                setActiveNav(key);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <Icon name={icon} size={19} />
              <span>{label}</span>
              {key === "check" && unfinishedTasks.length > 0 && <span className="nav-count">{unfinishedTasks.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <div className="note-spark"><Icon name="spark" size={17} /></div>
            <p>Road to topnotcher!</p>
            <span>kaya mo to love💚</span>
          </div>
          <button className="profile">
            <span className="avatar">E</span>
            <span className="profile-copy"><strong>Elys</strong><small>4th year · Nursing</small></span>
            <span className="profile-dots">···</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">My learning <span>/</span> <strong>{pageLabels[activeNav]}</strong></div>
          <div className="topbar-right">
            <div className="top-stat streak-stat"><span className="flame-icon"><Icon name="flame" size={19} /></span><strong>{progress.streak}</strong><span>day streak</span></div>
            <div className="top-stat xp-stat"><span className="xp-star">✳</span><strong>{progress.xp}</strong><span>XP</span></div>
            <button className="top-avatar" aria-label="Lock study space" title="Lock study space" onClick={lockSite}>E</button>
          </div>
        </header>

        <div className="page-content">
          {activeNav !== "home" && !["study", "cards"].includes(activeNav) && (
            <section className="page-title-row">
              <div className="section-kicker">{pageLabels[activeNav].toUpperCase()}</div>
              <h1>{pageLabels[activeNav]}</h1>
              <p>{pageDescriptions[activeNav]}</p>
            </section>
          )}

          {activeNav === "study" ? <StudyRoom
            guides={studyGuides}
            loading={studyGuidesLoading}
            error={studyGuidesError}
            initialSlug={studyRoomInitialSlug}
            readGuides={reviewedGuideSlugs}
            onGuideReviewed={(slug) => setReviewedGuideSlugs((current) => current.includes(slug) ? current : [...current, slug])}
            onClose={() => setActiveNav("home")}
            onStartQuiz={startStudyGuideQuiz}
            onBrowseFlashcards={(topic, slug) => openFlashcards(topic, slug)}
          /> : <DashboardPages
            activeNav={activeNav}
            todayLabel={todayLabel}
            dashboard={dashboard}
            taskStats={{ unfinishedTasks, completedTasks }}
            reviewStats={{ completedStudyQuizzes, completedReviewCount, reviewPathLength, reviewCompletionPercent }}
            studyState={{
              studyGuides,
              studyGuidesLoading,
              studyGuidesError,
              reviewedGuideCount,
              reviewedGuideSlugs,
              nextGuideSlug,
            }}
            actions={{ loadStudyGuides, openStudyRoom, startStudyGuideQuiz, addTask, toggleTask, removeTask, onGeneratedStudyGuide: openGeneratedStudyGuide }}
          />}
        </div>
      </main>
      {activeLesson && <QuizModal lesson={activeLesson} onClose={() => setActiveLesson(null)} onSubmit={submitLesson} />}
      {flashcardsOpen && <FlashcardModal cards={flashcards} loading={flashcardsLoading} error={flashcardsError} initialTopic={flashcardTopic} onClose={() => { setFlashcardsOpen(false); setActiveNav("home"); }} />}
      {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice("")}><Icon name="close" size={16} /></button></div>}
    </div>
  );
}





export default App;
