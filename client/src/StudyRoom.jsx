import { useEffect, useState } from "react";
import { Icon } from "./icons.jsx";

export default function StudyRoom({ guides, loading, error, initialSlug, readGuides, onGuideReviewed, onClose, onStartQuiz, onBrowseFlashcards }) {
  const [selectedSlug, setSelectedSlug] = useState(initialSlug || "");

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
  }

  function moveGuide(direction) {
    if (guides.length < 1) return;
    const nextIndex = (selectedIndex + direction + guides.length) % guides.length;
    setSelectedSlug(guides[nextIndex].slug);
  }

  function markRead() {
    if (guide && !isRead) {
      onGuideReviewed(guide.slug);
    }
    moveGuide(1);
  }

  return (
    <div className="modal-backdrop study-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="study-room" role="dialog" aria-modal="true" aria-labelledby="study-room-title">
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
              <span className="study-unit-label">YOUR CCN UNITS</span>
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
                    <button className="study-flashcard-button" onClick={() => onBrowseFlashcards(guide.topic)}>Review flashcards</button>
                  </div>
                  <button className={`button ${isRead ? "button-remembered" : "button-primary"}`} onClick={markRead}>
                    {isRead ? "Reviewed ✓" : "Mark read & continue"} <Icon name="arrow" size={16} />
                  </button>
                </footer>
              </article>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
