import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "./api.js";
import DashboardPages from "./components/DashboardPages.jsx";
import FlashcardModal from "./components/FlashcardModal.jsx";
import QuizModal from "./components/QuizModal.jsx";
import { Icon } from "./icons.jsx";
import melodyPopupImage from "../images/melody-2.jpg";
import melodyStudyImage from "../images/melody-study.jpg";
import melodyTimerImage from "../images/melody-3.jpg";
import StudyRoom from "./StudyRoom.jsx";
import PageMelodyArt from "./components/PageMelodyArt.jsx";

const landingFeatures = [
  { icon: '⌂', name: 'Overview', description: 'See your study streak, weekly time, and next steps together.' },
  { icon: '▤', name: 'Learning path', description: 'Work through focused nursing study units at your own pace.' },
  { icon: '✓', name: 'Quick quizzes', description: 'Check your understanding with short, topic-based quizzes.' },
  { icon: '◷', name: 'Study room & timer', description: 'Read a guide and track real study sessions as you learn.' },
  { icon: '▣', name: 'Flashcards', description: 'Review key concepts with a personal set of study cards.' },
  { icon: '☑', name: 'To-dos', description: 'Turn your study goals into small tasks you can complete.' },
  { icon: '✎', name: 'Notepad', description: 'Keep your notes close while you review your materials.' },
  { icon: '✧', name: 'AI guide', description: 'Create a study guide from your own learning materials.' },
  { icon: '↗', name: 'Progress', description: 'Follow completed quizzes, study time, and your progress.' },
];

function formatElapsedStudyTime(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function App() {
  const [dashboard, setDashboard] = useState(null);
  const [activeNav, setActiveNav] = useState("home");
  const [activeLesson, setActiveLesson] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [flashcardTopic, setFlashcardTopic] = useState("All topics");
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [flashcardsError, setFlashcardsError] = useState("");
  const [studyRoomInitialSlug, setStudyRoomInitialSlug] = useState("");
  const [studyGuides, setStudyGuides] = useState([]);
  const [studyGuidesLoading, setStudyGuidesLoading] = useState(false);
  const [studyGuidesError, setStudyGuidesError] = useState("");
  const [reviewedGuideSlugs, setReviewedGuideSlugs] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [studyTimerNow, setStudyTimerNow] = useState(Date.now());
  const [showMelodyPopup, setShowMelodyPopup] = useState(true);
  const [landingFeature, setLandingFeature] = useState(0);
  const studyGuidesRequestStarted = useRef(false);
  const [notice, setNotice] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [user, setUser] = useState(null);
  const [accessError, setAccessError] = useState("");
  const [accessLocked, setAccessLocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const savedWidth = Number(window.localStorage.getItem("nurselys-sidebar-width"));
    return Number.isFinite(savedWidth) && savedWidth >= 210 && savedWidth <= 340 ? savedWidth : 246;
  });
  const sidebarResizePointer = useRef(null);
  const studySessionsRequestStarted = useRef(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [session, dashboardData] = await Promise.all([api("/auth/me"), api("/dashboard")]);
      setUser(session.user);
      setDashboard(dashboardData);
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

  const applyStudySessionSummary = useCallback((summary) => {
    setStudySessions(summary.sessions || []);
    setDashboard((current) => current ? {
      ...current,
      progress: { ...current.progress, weeklyMinutes: summary.weeklyMinutes || 0 },
    } : current);
  }, []);

  const loadStudySessions = useCallback(async () => {
    const summary = await api("/study-sessions");
    applyStudySessionSummary(summary);
    return summary;
  }, [applyStudySessionSummary]);

  useEffect(() => {
    if (dashboard && !studySessionsRequestStarted.current) {
      studySessionsRequestStarted.current = true;
      loadStudySessions().catch((loadError) => setNotice(loadError.message));
    }
  }, [dashboard, loadStudySessions]);

  const activeStudySession = studySessions.find((session) => !session.endedAt) || null;
  const hasActiveStudySession = Boolean(activeStudySession);
  useEffect(() => {
    if (!activeStudySession) return undefined;
    const timer = window.setInterval(() => setStudyTimerNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [activeStudySession?.startedAt]);
  useEffect(() => {
    if (!hasActiveStudySession) return undefined;
    const interval = window.setInterval(() => {
      loadStudySessions().catch((loadError) => setNotice(loadError.message));
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [hasActiveStudySession, loadStudySessions]);

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

  async function removeStudyGuide(slug) {
    const guide = studyGuides.find((item) => item.slug === slug);
    if (!guide?.userOwned) return;
    if (!window.confirm("Delete this study room unit, its quiz, and all flashcards made from it?")) return;
    try {
      await api("/study-guides/" + encodeURIComponent(slug), { method: "DELETE" });
      setStudyGuides((current) => current.filter((item) => item.slug !== slug));
      setReviewedGuideSlugs((current) => current.filter((item) => item !== slug));
      setFlashcards((current) => current.filter((card) => card.studyGuideSlug !== slug));
      setDashboard((current) => {
        if (!current) return current;
        const completed = current.progress.completedStudyQuizzes || [];
        return {
          ...current,
          progress: {
            ...current.progress,
            completedStudyQuizzes: completed.filter((item) => item !== slug),
            completedCount: Math.max(0, (current.progress.completedCount || 0) - Number(completed.includes(slug))),
          },
        };
      });
      setNotice("Study unit, quiz, and linked flashcards deleted.");
    } catch (deleteError) {
      setNotice(deleteError.message);
    }
  }
  async function removeFlashcard(card) {
    if (!card?.userOwned) return;
    if (!window.confirm("Delete this flashcard?")) return;
    try {
      await api("/flashcards/" + encodeURIComponent(card.slug), { method: "DELETE" });
      setFlashcards((current) => current.filter((item) => item.slug !== card.slug));
      setNotice("Flashcard deleted.");
    } catch (deleteError) {
      setNotice(deleteError.message);
    }
  }
  async function removeStudySession(sessionId) {
    try {
      await api(`/study-sessions/${sessionId}`, { method: "DELETE" });
      await loadStudySessions();
    } catch (sessionError) {
      setNotice(sessionError.message);
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
    if (!authEmail || !authPassword || (authMode === "register" && !authName)) return;
    setUnlocking(true);
    setAccessError("");
    try {
      const endpoint = authMode === "register" ? "/auth/register" : "/auth/login";
      await api(endpoint, {
        method: "POST",
        body: JSON.stringify({
          ...(authMode === "register" ? { name: authName } : {}),
          email: authEmail,
          password: authPassword,
        }),
      });
      setAccessLocked(false);
      setAuthPassword("");
      await loadDashboard();
    } catch (authError) {
      setAccessError(authError.message);
    } finally {
      setUnlocking(false);
    }
  }
  async function lockSite() {
    try {
      await api("/auth/logout", { method: "POST" });
      setAccessLocked(true);
      setDashboard(null);
      setUser(null);
      setStudyGuides([]);
      setFlashcards([]);
      setStudySessions([]);
      setReviewedGuideSlugs([]);
      setActiveLesson(null);
      studyGuidesRequestStarted.current = false;
      studySessionsRequestStarted.current = false;
      setActiveNav("home");
    } catch (lockError) {
      setNotice(lockError.message);
    }
  }

  if (loading && !dashboard && !accessLocked) {
    return <div className="loading-screen"><span className="loader" /><span>Getting your study space ready…</span></div>;
  }

  if (accessLocked) {
    const registering = authMode === "register";
    return (
      <main className="access-screen landing-screen">
        <div className="landing-shell">
          <section className="landing-welcome" aria-labelledby="landing-heading">
            <div className="landing-topline">
              <a className="brand access-brand" href="#" onClick={(event) => event.preventDefault()}>
                <span className="brand-mark">n<span>+</span></span>
                <span className="brand-name">nurse<span>lys</span></span>
              </a>
              <span className="landing-private"><span aria-hidden="true">✦</span> YOUR PERSONAL STUDY SPACE</span>
            </div>
            <div className="landing-copy">
              <span className="section-kicker">A LITTLE STUDY MAGIC</span>
              <h1 id="landing-heading">Make room for a brighter study day.</h1>
              <p>Your nursing goals are closer than they feel. Come in, find your focus, and take the next small step.</p>
              <div className="landing-highlights" aria-label="Study space highlights">
                <span><i aria-hidden="true">✧</i> Study at your pace</span>
                <span><i aria-hidden="true">♡</i> Celebrate every win</span>
              </div>
            </div>
            <section className="landing-feature-tour" aria-label="Explore Nurselys features">
              <div className="landing-feature-content">
                <div className="landing-feature-heading">
                  <span className="section-kicker">YOUR STUDY SPACE, ALL IN ONE</span>
                  <span className="landing-feature-count">{String(landingFeature + 1).padStart(2, "0")} / 09</span>
                </div>
                <div className="landing-feature-tabs" role="group" aria-label="Choose a feature to preview">
                  {landingFeatures.map((feature, index) => (
                    <button
                      className={`landing-feature-tab ${landingFeature === index ? "is-active" : ""}`}
                      type="button"
                      key={feature.name}
                      aria-pressed={landingFeature === index}
                      onClick={() => setLandingFeature(index)}
                    >
                      <span aria-hidden="true">{feature.icon}</span>{feature.name}
                    </button>
                  ))}
                </div>
                <div className="landing-feature-preview" aria-live="polite" aria-atomic="true">
                  <span className="landing-feature-preview-icon" aria-hidden="true">{landingFeatures[landingFeature].icon}</span>
                  <div>
                    <strong>{landingFeatures[landingFeature].name}</strong>
                    <p>{landingFeatures[landingFeature].description}</p>
                  </div>
                </div>
              </div>
              <div className="landing-art" aria-hidden="true">
                <span className="landing-art-orbit landing-art-orbit-one" />
                <span className="landing-art-orbit landing-art-orbit-two" />
                <span className="landing-art-spark landing-art-spark-one">✦</span>
                <span className="landing-art-spark landing-art-spark-two">✧</span>
                <img src={melodyStudyImage} alt="" />
              </div>
            </section>
            <div className="landing-footer"><span>✿</span> A calm little corner to learn, grow, and glow.</div>
          </section>

          <form className="access-card landing-login-card" onSubmit={unlockSite}>
            <div className="landing-login-icon" aria-hidden="true">n<span>+</span></div>
            <div className="section-kicker">{registering ? "YOUR NEXT CHAPTER" : "WELCOME BACK"}</div>
            <h2>{registering ? "Create your account" : "Log in to your space"}</h2>
            <p>{registering ? "Create a private study space to keep your progress and materials together." : "Sign in to pick up where you left off."}</p>
            {registering && (
              <>
                <label className="access-label" htmlFor="auth-name">YOUR NAME</label>
                <input id="auth-name" className="access-input" type="text" autoComplete="name" required minLength={2} maxLength={60} value={authName} onChange={(event) => setAuthName(event.target.value)} placeholder="Your name" />
              </>
            )}
            <label className="access-label" htmlFor="auth-email">EMAIL ADDRESS</label>
            <input id="auth-email" className="access-input" type="email" autoComplete="email" required value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@example.com" />
            <label className="access-label landing-password-label" htmlFor="auth-password">PASSWORD</label>
            <input id="auth-password" className="access-input" type="password" autoComplete={registering ? "new-password" : "current-password"} required minLength={registering ? 8 : undefined} maxLength={128} value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder={registering ? "At least 8 characters" : "Enter your password"} aria-describedby={accessError ? "access-error" : undefined} />
            {accessError && <span className="access-error" id="access-error" role="alert">{accessError}</span>}
            <button className="button button-primary access-submit" type="submit" disabled={unlocking}>
              {unlocking ? (registering ? "Creating account…" : "Signing in…") : (registering ? "Create my account" : "Log in")} {!unlocking && <Icon name="arrow" size={17} />}
            </button>
            <div className="landing-auth-switch">
              <span>{registering ? "Already have an account?" : "New to Nurselys?"}</span>
              <button type="button" onClick={() => { setAuthMode(registering ? "login" : "register"); setAccessError(""); }}>
                {registering ? "Log in" : "Create an account"}
              </button>
            </div>
            <div className="landing-login-note"><span aria-hidden="true">♡</span> Your learning journey is waiting for you.</div>
          </form>
        </div>
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
  const completedReviewCount = studyGuides.filter((guide) => completedStudyQuizzes.includes(guide.slug)).length;
  const reviewPathLength = studyGuides.length;
  const reviewCompletionPercent = reviewPathLength
    ? Math.round((completedReviewCount / reviewPathLength) * 100)
    : 0;
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
    <div className="app-shell" style={{ "--sidebar-width": `${sidebarWidth}px` }}>
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
            <img className="sidebar-melody" src={melodyPopupImage} alt="" />
            <div className="note-spark"><Icon name="spark" size={17} /></div>
            <p>Road to topnotcher!</p>
            <span>You can do this</span>
          </div>
          <button className="profile" onClick={lockSite} title="Sign out">
            <span className="avatar">{(user?.name || "U").slice(0, 1).toUpperCase()}</span>
            <span className="profile-copy"><strong>{user?.name || "Student"}</strong><small>Sign out</small></span>
            <span className="profile-dots">···</span>
          </button>
        </div>
      </aside>
      <button
        type="button"
        className="sidebar-resize-handle"
        role="separator"
        aria-label="Resize sidebar"
        aria-orientation="vertical"
        aria-valuemin={210}
        aria-valuemax={340}
        aria-valuenow={sidebarWidth}
        onPointerDown={(event) => {
          sidebarResizePointer.current = event.clientX;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (sidebarResizePointer.current === null) return;
          const nextWidth = Math.max(210, Math.min(340, event.clientX));
          setSidebarWidth(nextWidth);
          window.localStorage.setItem("nurselys-sidebar-width", String(nextWidth));
        }}
        onPointerUp={(event) => {
          sidebarResizePointer.current = null;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => { sidebarResizePointer.current = null; }}
        onKeyDown={(event) => {
          if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
          event.preventDefault();
          setSidebarWidth((current) => {
            const nextWidth = Math.max(210, Math.min(340, current + (event.key === "ArrowRight" ? 12 : -12)));
            window.localStorage.setItem("nurselys-sidebar-width", String(nextWidth));
            return nextWidth;
          });
        }}
      />

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">My learning <span>/</span> <strong>{pageLabels[activeNav]}</strong></div>
          <div className="topbar-right">
            <div className="top-stat streak-stat"><span className="flame-icon"><Icon name="flame" size={19} /></span><strong>{progress.streak}</strong><span>day streak</span></div>
            <div className="top-stat xp-stat"><span className="xp-star">✳</span><strong>{progress.xp}</strong><span>XP</span></div>
            <button className="top-avatar" aria-label="Sign out" title="Sign out" onClick={lockSite}>{(user?.name || "U").slice(0, 1).toUpperCase()}</button>
          </div>
        </header>

        <div className={`page-content ${activeNav === "study" ? "study-room-content" : ""}`}>
          {activeNav !== "home" && !["study", "cards"].includes(activeNav) && (
            <section className="page-title-row">
              <div className="section-kicker">{pageLabels[activeNav].toUpperCase()}</div>
              <h1>{pageLabels[activeNav]}</h1>
              <p>{pageDescriptions[activeNav]}</p>
            </section>
          )}

          { ["path", "quiz", "chart"].includes(activeNav) && <PageMelodyArt page={activeNav} />}
          {activeNav === "cards" ? <FlashcardModal cards={flashcards} loading={flashcardsLoading} error={flashcardsError} initialTopic={flashcardTopic} onDeleteCard={removeFlashcard} onClose={() => setActiveNav("home")} /> : activeNav === "study" ? <StudyRoom
            guides={studyGuides}
            userName={user?.name}
            loading={studyGuidesLoading}
            error={studyGuidesError}
            initialSlug={studyRoomInitialSlug}
            readGuides={reviewedGuideSlugs}
            onGuideReviewed={(slug) => setReviewedGuideSlugs((current) => current.includes(slug) ? current : [...current, slug])}
            onClose={() => setActiveNav("home")}
            onStartQuiz={startStudyGuideQuiz}
            onBrowseFlashcards={(topic, slug) => openFlashcards(topic, slug)}
            onDeleteGuide={removeStudyGuide}
            onSessionsChanged={applyStudySessionSummary}
          /> : <DashboardPages
            activeNav={activeNav}
            todayLabel={todayLabel}
            user={user}
            dashboard={dashboard}
            studySessions={studySessions}
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
            actions={{ loadStudyGuides, openStudyRoom, startStudyGuideQuiz, addTask, toggleTask, removeTask, removeStudySession, removeStudyGuide, onGeneratedStudyGuide: openGeneratedStudyGuide }}
          />}
        </div>
      </main>      {activeStudySession && activeNav !== "study" && (
        <aside className="floating-study-timer" aria-label="Active study timer">
          <span className="floating-study-timer-label"><span className="floating-study-timer-dot" /> STUDY SESSION IN PROGRESS</span>
          <img className="study-timer-melody" src={melodyTimerImage} alt="My Melody" />
          <strong aria-live="off">{formatElapsedStudyTime(Math.floor((studyTimerNow - Date.parse(activeStudySession.startedAt)) / 1000))}</strong>
          <button type="button" onClick={() => setActiveNav("study")}>
            Open Study Room <Icon name="arrow" size={15} />
          </button>
        </aside>
      )}      {activeLesson && <QuizModal lesson={activeLesson} onClose={() => setActiveLesson(null)} onSubmit={submitLesson} />}
      {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice("")}><Icon name="close" size={16} /></button></div>}
    </div>
  );
}





export default App;
