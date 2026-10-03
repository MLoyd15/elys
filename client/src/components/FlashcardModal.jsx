import { useEffect, useState } from "react";
import { Icon } from "../icons.jsx";

export default function FlashcardModal({ cards, loading, error, onClose, initialTopic = "All topics" }) {
  const [topic, setTopic] = useState(initialTopic);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [remembered, setRemembered] = useState([]);
  const topics = [...new Set(cards.map((card) => card.topic))];
  const deck = cards.filter((card) => topic === "All topics" || card.topic === topic);
  const card = deck[cardIndex];
  const isRemembered = card ? remembered.includes(card.slug) : false;
  const rememberedCount = deck.filter((item) => remembered.includes(item.slug)).length;

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
      if (event.target instanceof HTMLElement && ["INPUT", "SELECT", "TEXTAREA"].includes(event.target.tagName)) return;
      if (event.key === "ArrowLeft") moveCard(-1);
      if (event.key === "ArrowRight") moveCard(1);
      if (event.code === "Space") {
        event.preventDefault();
        setFlipped((current) => !current);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deck.length, onClose]);

  function changeTopic(nextTopic) {
    setTopic(nextTopic);
    setCardIndex(0);
    setFlipped(false);
  }

  function moveCard(direction) {
    setCardIndex((index) => (index + direction + deck.length) % deck.length);
    setFlipped(false);
  }

  function markRemembered() {
    if (card && !isRemembered) {
      setRemembered((current) => [...current, card.slug]);
    }
    if (deck.length > 1) moveCard(1);
    else setFlipped(false);
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="flashcard-modal" role="dialog" aria-modal="true" aria-labelledby="flashcard-title">
        <div className="quiz-top">
          <span className="quiz-brand"><span>n+</span> flashcard practice</span>
          <button className="modal-close" onClick={onClose} aria-label="Close flashcards"><Icon name="close" size={20} /></button>
        </div>
        <div className="flashcard-heading">
          <div className="section-kicker">A LITTLE PRACTICE GOES A LONG WAY</div>
          <h1 id="flashcard-title">Quick recall, stronger care.</h1>
          <p>Think of your answer, then flip the card to check.</p>
        </div>
        <div className="flashcard-toolbar">
          <label htmlFor="flashcard-topic">Study topic</label>
          <select id="flashcard-topic" value={topic} onChange={(event) => changeTopic(event.target.value)}>
            <option>All topics</option>
            {topics.map((item) => <option key={item}>{item}</option>)}
          </select>
          {!loading && !error && <span className="flashcard-count">{rememberedCount} of {deck.length} remembered</span>}
        </div>
        {loading ? <div className="flashcard-message"><span className="loader" /> Loading your flashcards…</div>
          : error ? <div className="flashcard-message flashcard-error" role="alert">{error}</div>
            : !card ? <div className="flashcard-message">There are no cards in this topic yet.</div>
              : <>
                <button
                  className={`flashcard ${flipped ? "is-flipped" : ""}`}
                  onClick={() => setFlipped((current) => !current)}
                  aria-label={flipped ? "Show flashcard question" : "Reveal flashcard answer"}
                  aria-pressed={flipped}
                >
                  <span className="flashcard-card-top"><span>{card.topic}</span><span>{String(cardIndex + 1).padStart(2, "0")} / {String(deck.length).padStart(2, "0")}</span></span>
                  <span className="flashcard-face">{flipped ? "ANSWER" : "QUESTION"}</span>
                  <span className="flashcard-main">{flipped ? card.answer : card.question}</span>
                  {!flipped && <span className="flashcard-hint">Hint: {card.hint}</span>}
                  <span className="flashcard-source">Source: {card.source}</span>
                  <span className="flashcard-flip-label">{flipped ? "↻  Tap to see question" : "↻  Tap to reveal answer"}</span>
                </button>
                <div className="flashcard-controls">
                  <button className="flashcard-nav" onClick={() => moveCard(-1)} aria-label="Previous flashcard">←</button>
                  <button className={`button ${isRemembered ? "button-remembered" : "button-primary"}`} disabled={!flipped} onClick={markRemembered}>
                    {isRemembered ? "Got it ✓" : "Got it — next card"} <Icon name="arrow" size={17} />
                  </button>
                  <button className="flashcard-nav" onClick={() => moveCard(1)} aria-label="Next flashcard">→</button>
                </div>
                <div className="flashcard-disclaimer">For study review only. Follow your course and facility guidance.</div>
              </>}
      </section>
    </div>
  );
}
