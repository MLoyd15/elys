import { useEffect, useState } from "react";
import { api } from "./api.js";
import { Icon } from "./icons.jsx";
import melodyTimerImage from "../images/melody-3.jpg";

function formatStudyMaterials(guide, cards, quiz) {
  const sections = guide.sections.map((section, index) => [
    `## ${index + 1}. ${section.title}`,
    "",
    section.body,
    "",
    ...section.bullets.map((bullet) => `- ${bullet}`),
  ].join("\n"));
  const flashcards = cards.map((card, index) => [
    `### ${index + 1}. ${card.question}`,
    `- Answer: ${card.answer}`,
    `- Hint: ${card.hint}`,
  ].join("\n"));
  const questions = quiz.questions.map((question, index) => [
    `### ${index + 1}. ${question.prompt}`,
    "",
    ...question.options.map((option, optionIndex) =>
      `- ${String.fromCharCode(65 + optionIndex)}. ${option}${optionIndex === question.answer ? " (Correct answer)" : ""}`,
    ),
    "",
    `**Answer:** ${question.options[question.answer]}`,
    `**Rationale:** ${question.explanation}`,
  ].join("\n"));

  return [
    `# ${guide.title}`,
    "",
    `**Topic:** ${guide.topic}  `,
    `**Source:** ${guide.source}  `,
    `**Reading time:** ${guide.readTime}`,
    "",
    "## Introduction",
    "",
    guide.introduction,
    "",
    "## Learning objectives",
    "",
    ...guide.objectives.map((objective) => `- ${objective}`),
    "",
    ...sections,
    "## Reflection",
    "",
    guide.reflection,
    "",
    "## Clinical reminder",
    "",
    guide.safetyNote,
    "",
    `## Flashcards (${cards.length})`,
    "",
    ...(flashcards.length ? flashcards : ["No flashcards are available for this guide."]),
    "",
    `## Quiz (${quiz.questions.length} questions)`,
    "",
    ...questions,
    "",
    "---",
    "For study review only. Follow your course and facility guidance.",
  ].join("\n");
}

function formatTimer(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;
  return [hours, minutes, remainingSeconds].map((part) => String(part).padStart(2, "0")).join(":");
}

export default function StudyRoom({ guides, userName, loading, error, initialSlug, readGuides, onGuideReviewed, onClose, onStartQuiz, onBrowseFlashcards, onSessionsChanged, onDeleteGuide }) {
  const [selectedSlug, setSelectedSlug] = useState(initialSlug || "");
  const [savingMaterials, setSavingMaterials] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [timerSession, setTimerSession] = useState(null);
  const [timerNow, setTimerNow] = useState(Date.now());
  const [timerBusy, setTimerBusy] = useState(false);
  const [timerError, setTimerError] = useState("");

  useEffect(() => {
    let mounted = true;
    api("/study-sessions")
      .then((summary) => {
        if (!mounted) return;
        setTimerSession(summary.activeSession);
        onSessionsChanged(summary);
      })
      .catch((loadError) => {
        if (mounted) setTimerError(loadError.message);
      });
    return () => { mounted = false; };
  }, [onSessionsChanged]);

  useEffect(() => {
    if (!timerSession) return undefined;
    const interval = window.setInterval(() => setTimerNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [timerSession?.startedAt]);

  async function toggleStudyTimer() {
    if (timerBusy) return;
    setTimerBusy(true);
    setTimerError("");
    try {
      if (timerSession) {
        const summary = await api("/study-sessions/stop", { method: "POST" });
        setTimerSession(null);
        setTimerNow(Date.now());
        onSessionsChanged(summary);
      } else {
        const { session } = await api("/study-sessions/start", { method: "POST" });
        setTimerSession(session);
        setTimerNow(Date.now());
        onSessionsChanged(await api("/study-sessions"));
      }
    } catch (timerActionError) {
      setTimerError(timerActionError.message);
    } finally {
      setTimerBusy(false);
    }
  }

  useEffect(() => {
    if (initialSlug && guides.some((guide) => guide.slug === initialSlug)) {
      setSelectedSlug(initialSlug);
    } else if (!selectedSlug && guides.length > 0) {
      setSelectedSlug(guides[0].slug);
    }
  }, [guides, initialSlug, selectedSlug]);

  const selectedIndex = guides.findIndex((guide) => guide.slug === selectedSlug);
  const guide = selectedIndex >= 0 ? guides[selectedIndex] : null;
  const isRead = guide ? readGuides.includes(guide.slug) : false;

  function selectGuide(slug) {
    setSelectedSlug(slug);
    setSaveMessage("");
  }

  function moveGuide(direction) {
    if (guides.length < 1) return;
    const nextIndex = (selectedIndex + direction + guides.length) % guides.length;
    setSelectedSlug(guides[nextIndex].slug);
    setSaveMessage("");
  }

  function markRead() {
    if (guide && !isRead) {
      onGuideReviewed(guide.slug);
    }
    moveGuide(1);
  }

  async function saveMaterials() {
    if (!guide || savingMaterials) return;
    setSavingMaterials(true);
    setSaveMessage("");
    let downloadUrl;
    try {
      const encodedSlug = encodeURIComponent(guide.slug);
      const [quiz, cards] = await Promise.all([
        api(`/study-guides/${encodedSlug}/quiz`),
        api(`/flashcards?studyGuide=${encodedSlug}`),
      ]);
      const file = new Blob([formatStudyMaterials(guide, cards, quiz)], { type: "text/markdown;charset=utf-8" });
      const objectUrl = URL.createObjectURL(file);
      downloadUrl = objectUrl;
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${guide.slug}-study-materials.md`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      downloadUrl = undefined;
      setSaveMessage("All study materials downloaded.");
    } catch (saveError) {
      setSaveMessage(`Couldn’t save all study materials: ${saveError.message}`);
    } finally {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setSavingMaterials(false);
    }
  }

  return (
    <section className="study-room study-room-page" aria-labelledby="study-room-title">
        <header className="study-room-header">
          <a className="brand study-brand" href="#" onClick={(event) => event.preventDefault()}>
            <span className="brand-mark">n<span>+</span></span>
            <span className="brand-name">nurse<span>lys</span></span>
          </a>
          <div className="study-room-title-block">
            <span className="section-kicker">{userName ? userName.toUpperCase() + " · STUDY SPACE" : "YOUR STUDY SPACE"}</span>
            <h1 id="study-room-title">Study room</h1>
          </div>
          <span className="study-read-count">{readGuides.length} of {guides.length} reviewed</span>
          <div className={`study-timer ${timerSession ? "is-running" : ""}`}>
            <img className="study-timer-melody" src={melodyTimerImage} alt="My Melody" />
            <span className="study-timer-readout" aria-live="off">
              <span>{timerSession ? "STUDY SESSION" : "STUDY TIMER"}</span>
              <strong>{formatTimer(timerSession ? Math.floor((timerNow - Date.parse(timerSession.startedAt)) / 1000) : 0)}</strong>
            </span>
            <button type="button" className="study-timer-button" onClick={toggleStudyTimer} disabled={timerBusy}>
              {timerBusy ? "Please wait…" : timerSession ? "Stop timer" : "Start timer"}
            </button>
          </div>
          <button className="study-back-button" onClick={onClose}><Icon name="arrow" size={16} /> Back to overview</button>
        </header>
        {timerError && <div className="study-timer-error" role="alert">{timerError}</div>}
        {loading ? (
          <div className="study-empty"><span className="loader" /><span>Opening your study notes…</span></div>
        ) : error ? (
          <div className="study-empty study-load-error" role="alert"><strong>We couldn’t load the study notes.</strong><span>{error}</span></div>
        ) : guides.length === 0 ? (
          <div className="study-empty">Study notes are not available yet.</div>
        ) : (
          <div className="study-room-body">
            <aside className="study-unit-list" aria-label="Study units">
              <span className="study-unit-label">YOUR STUDY UNITS</span>
              {guides.map((item, index) => (
                <button
                  key={item.slug}
                  className={`study-unit-button ${guide?.slug === item.slug ? "selected" : ""}`}
                  onClick={() => selectGuide(item.slug)}
                  aria-current={guide?.slug === item.slug ? "page" : undefined}
                >
                  <span className="study-unit-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="study-unit-copy"><strong>{item.topic}</strong><small>{item.readTime}</small></span>
                  {readGuides.includes(item.slug) && <span className="study-unit-done" aria-label="Reviewed">✓</span>}
                </button>
              ))}
              <div className="study-sidebar-note">Read at your own pace. You can come back to any unit anytime.</div>
            </aside>
            {guide && (
              <article className="study-article">
                <div className="study-article-inner">
                  <div className="study-article-meta"><span>{guide.topic}</span><span>·</span><span>{guide.readTime}</span></div>
                  <h2>{guide.title}</h2>
                  <p className="study-introduction">{guide.introduction}</p>
                  <section className="study-objectives">
                    <h3>After this unit, you can…</h3>
                    <ul>{guide.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
                  </section>
                  <div className="study-sections">
                    {guide.sections.map((section, index) => (
                      <section className="study-section" key={section.title}>
                        <div className="study-section-heading"><span>{String(index + 1).padStart(2, "0")}</span><h3>{section.title}</h3></div>
                        <p>{section.body}</p>
                        <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
                      </section>
                    ))}
                  </div>
                  <section className="study-reflection"><span>PAUSE & THINK</span><p>{guide.reflection}</p></section>
                  <aside className="study-safety-note"><strong>Clinical reminder</strong><span>{guide.safetyNote}</span></aside>
                  <div className="study-source">Adapted and paraphrased from {guide.source}. Use alongside current course materials.</div>
                </div>
                <footer className="study-article-footer">
                  <button className="study-step-button" onClick={() => moveGuide(-1)}>← Previous unit</button>
                  <div className="study-practice-actions">
                    <button className="study-quiz-button" onClick={() => onStartQuiz(guide.slug)}>Take quiz</button>
                    <button className="study-flashcard-button" onClick={() => onBrowseFlashcards(guide.topic, guide.slug)}>Review flashcards</button>
                    {guide.userOwned && <button className="study-material-delete" onClick={() => onDeleteGuide?.(guide.slug)}><Icon name="trash" size={14} /> Delete unit & quiz</button>}
                    <button className="study-save-button" onClick={saveMaterials} disabled={savingMaterials}>
                      <Icon name="download" size={14} /> {savingMaterials ? "Saving…" : "Save all materials"}
                    </button>
                  </div>
                  <button className={`button ${isRead ? "button-remembered" : "button-primary"}`} onClick={markRead}>
                    {isRead ? "Reviewed ✓" : "Mark read & continue"} <Icon name="arrow" size={16} />
                  </button>
                  {saveMessage && <span className="study-save-message" role={saveMessage.startsWith("Couldn’t") ? "alert" : "status"}>{saveMessage}</span>}
                </footer>
              </article>
            )}
          </div>
        )}
    </section>
  );
}
