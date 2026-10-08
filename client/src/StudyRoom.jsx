import { useEffect, useState } from "react";
import { api } from "./api.js";
import { Icon } from "./icons.jsx";

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

const STUDY_ROOM_STYLES = String.raw`.study-backdrop { padding: 18px; }
.study-room { display: flex; flex-direction: column; width: min(1040px, 100%); height: min(790px, calc(100vh - 36px)); min-height: 450px; overflow: hidden; border: 1px solid #e8ede6; border-radius: 18px; background: #fff; box-shadow: 0 20px 70px rgb(18 37 24 / 20%); }
.study-room-header { display: flex; flex: 0 0 auto; align-items: center; gap: 16px; min-height: 73px; padding: 11px 21px; border-bottom: 1px solid #edf0eb; }
.study-brand { flex: 0 0 auto; margin: 0; }
.study-brand .brand-mark { width: 31px; height: 31px; border-radius: 10px; font-size: 22.8px; }
.study-brand .brand-name { font-size: 19.2px; }
.study-room-title-block { padding-left: 17px; border-left: 1px solid #e9eee7; }
.study-room-title-block .section-kicker { font-size: 9.6px; }
.study-room-title-block h1 { margin: 2px 0 0; color: #344338; font-family: var(--serif); font-size: 19.2px; font-weight: 800; }
.study-read-count { margin-left: auto; color: #859387; font-size: 12px; white-space: nowrap; }
.study-room-body { display: grid; grid-template-columns: 235px minmax(0, 1fr); flex: 1; min-height: 0; }
.study-unit-list { display: flex; flex-direction: column; gap: 5px; overflow-y: auto; padding: 20px 12px 14px; border-right: 1px solid #edf0eb; background: #fbfcfa; }
.study-unit-label { padding: 0 9px 8px; color: #9aa49a; font-size: 9.6px; font-weight: 800; letter-spacing: 1px; }
.study-unit-button { display: flex; align-items: center; gap: 9px; min-height: 51px; padding: 7px 9px; border: 1px solid transparent; border-radius: 9px; color: #68766c; background: transparent; text-align: left; }
.study-unit-button:hover { background: #f2f6f0; }
.study-unit-button.selected { border-color: #e2ece0; color: #4d7957; background: #edf5eb; }
.study-unit-number { color: #9daa9b; font-size: 10.8px; font-weight: 800; }
.study-unit-copy { display: grid; gap: 3px; min-width: 0; }
.study-unit-copy strong { overflow: hidden; font-size: 12px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.study-unit-copy small { color: #97a196; font-size: 9.6px; }
.study-unit-done { display: grid; place-items: center; width: 17px; height: 17px; margin-left: auto; border-radius: 50%; color: #fff; background: #69a478; font-size: 12px; }
.study-sidebar-note { margin-top: auto; padding: 12px 10px 0; border-top: 1px solid #edf0eb; color: #9aa39a; font-size: 10.8px; line-height: 1.55; }
.study-article { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.study-article-inner { flex: 1; overflow: auto; padding: 28px clamp(22px, 5vw, 56px) 26px; }
.study-article-meta { display: flex; gap: 7px; color: #7d987e; font-size: 10.8px; font-weight: 700; }
.study-article-inner > h2 { margin: 9px 0 8px; color: #2c3d31; font-family: var(--serif); font-size: clamp(25.2px, 3.6vw, 34.8px); font-weight: 800; letter-spacing: -1px; }
.study-introduction { max-width: 680px; margin: 0; color: #718074; font-size: 14.4px; line-height: 1.8; }
.study-objectives { margin-top: 20px; padding: 15px 17px; border: 1px solid #e8efe6; border-radius: 10px; background: #f8faf6; }
.study-objectives h3 { margin: 0 0 8px; color: #496a50; font-family: var(--serif); font-size: 13.2px; font-weight: 800; }
.study-objectives ul, .study-section ul { display: grid; gap: 7px; margin: 0; padding-left: 17px; }
.study-objectives li, .study-section li { padding-left: 2px; color: #69776c; font-size: 12px; line-height: 1.65; }
.study-objectives li::marker, .study-section li::marker { color: #77a67b; }
.study-sections { display: grid; gap: 19px; margin-top: 23px; }
.study-section { padding-bottom: 17px; border-bottom: 1px solid #edf0eb; }
.study-section-heading { display: flex; align-items: baseline; gap: 9px; }
.study-section-heading > span { color: #7da581; font-size: 10.8px; font-weight: 800; }
.study-section-heading h3 { margin: 0; color: #384b3d; font-family: var(--serif); font-size: 16.8px; font-weight: 800; }
.study-section > p { margin: 8px 0 10px; color: #738075; font-size: 12px; line-height: 1.75; }
.study-section li { font-size: 12px; }
.study-reflection { margin-top: 20px; padding: 14px 16px; border-left: 3px solid #d8bd76; border-radius: 0 8px 8px 0; background: #fbf8ee; }
.study-reflection > span { color: #9b8750; font-size: 9.6px; font-weight: 800; letter-spacing: 1px; }
.study-reflection p { margin: 6px 0 0; color: #625d4e; font-family: var(--serif); font-size: 13.2px; font-weight: 700; line-height: 1.6; }
.study-safety-note { display: grid; gap: 4px; margin-top: 13px; padding: 12px 14px; border: 1px solid #f0e7ce; border-radius: 8px; background: #fffcf4; }
.study-safety-note strong { color: #8c7541; font-size: 10.8px; }
.study-safety-note span { color: #807967; font-size: 10.8px; line-height: 1.65; }
.study-source { margin-top: 12px; color: #a0a89f; font-size: 9.6px; line-height: 1.5; }
.study-article-footer { display: flex; flex: 0 0 auto; align-items: center; justify-content: space-between; gap: 10px; padding: 12px clamp(15px, 4vw, 42px); border-top: 1px solid #edf0eb; background: #fff; }
.study-practice-actions { display: flex; align-items: center; gap: 9px; }
.study-step-button, .study-quiz-button, .study-flashcard-button { padding: 8px 5px; border: 0; color: #a94f6c; background: transparent; font-size: 10.8px; font-weight: 700; white-space: nowrap; }
.study-step-button:hover, .study-quiz-button:hover, .study-flashcard-button:hover { color: #833b55; text-decoration: underline; }
.study-quiz-button { display: inline-flex; align-items: center; gap: 5px; }
.study-quiz-button::before { content: "✦"; color: #4f9c71; font-size: 13.2px; }
.study-save-button { display: inline-flex; align-items: center; gap: 5px; padding: 8px 5px; border: 0; color: #a94f6c; background: transparent; font-size: 10.8px; font-weight: 700; white-space: nowrap; }
.study-save-button:hover { color: #833b55; text-decoration: underline; }
.study-save-button:disabled { cursor: wait; opacity: .65; }
.study-save-message { flex-basis: 100%; color: #73927a; font-size: 10.8px; text-align: right; }
.study-save-message[role="alert"] { color: #a65e54; }
.study-article-footer .button { flex: 0 0 auto; min-height: 34px; gap: 8px; padding: 0 11px; font-size: 10.8px; }
.study-empty { display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; gap: 13px; color: #77847a; font-size: 13.2px; }
.study-load-error { color: #a65e54; }`;

export default function StudyRoom({ guides, loading, error, initialSlug, readGuides, onGuideReviewed, onClose, onStartQuiz, onBrowseFlashcards }) {
  const [selectedSlug, setSelectedSlug] = useState(initialSlug || "");
  const [savingMaterials, setSavingMaterials] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (initialSlug && guides.some((guide) => guide.slug === initialSlug)) {
      setSelectedSlug(initialSlug);
    } else if (!selectedSlug && guides.length > 0) {
      setSelectedSlug(guides[0].slug);
    }
  }, [guides, initialSlug, selectedSlug]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
    <div className="modal-backdrop study-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="study-room" role="dialog" aria-modal="true" aria-labelledby="study-room-title">
        <style>{STUDY_ROOM_STYLES}</style>
        <header className="study-room-header">
          <a className="brand study-brand" href="#" onClick={(event) => event.preventDefault()}>
            <span className="brand-mark">n<span>+</span></span>
            <span className="brand-name">nurse<span>lys</span></span>
          </a>
          <div className="study-room-title-block">
            <span className="section-kicker">ELYS'S STUDY SPACE</span>
            <h1 id="study-room-title">Study room</h1>
          </div>
          <span className="study-read-count">{readGuides.length} of {guides.length} reviewed</span>
          <button className="modal-close" onClick={onClose} aria-label="Close study room"><Icon name="close" size={20} /></button>
        </header>
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
    </div>
  );
}
