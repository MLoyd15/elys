import { useEffect, useRef, useState } from "react";
import { Icon } from "../icons.jsx";
import melodyImageOne from "../../images/melody-study.jpg";
import melodyImageTwo from "../../images/melody-2.jpg";
import melodyImageThree from "../../images/melody-3.jpg";
import "../styles/FlashcardModal.css";

const pad = (value) => String(value).padStart(2, "0");
const melodyImages = [melodyImageOne, melodyImageTwo, melodyImageThree];

export default function FlashcardModal({ cards, loading, error, onClose, initialTopic = "All topics" }) {
  const [topic, setTopic] = useState(initialTopic);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [remembered, setRemembered] = useState([]);
  const [topicOpen, setTopicOpen] = useState(false);
  const topicPickerRef = useRef(null);
  const topicOptionRefs = useRef([]);
  const melodyAssignments = useRef(new Map());

  const topics = [...new Set(cards.map((card) => card.topic))];
  const deck = cards.filter((card) => topic === "All topics" || card.topic === topic);
  const card = deck[cardIndex];
  const isRemembered = card ? remembered.includes(card.slug) : false;
  const rememberedCount = deck.filter((item) => remembered.includes(item.slug)).length;
  const allRemembered = deck.length > 0 && rememberedCount === deck.length;
  const progress = deck.length ? (rememberedCount / deck.length) * 100 : 0;
  const topicOptions = ["All topics", ...topics];

  useEffect(() => {
    if (!topicOpen) return undefined;
    const selectedIndex = topicOptions.indexOf(topic);
    topicOptionRefs.current[selectedIndex >= 0 ? selectedIndex : 0]?.focus();
    function closeOnOutsideClick(event) {
      if (!topicPickerRef.current?.contains(event.target)) setTopicOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [topicOpen, topicOptions, topic]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      const tag = event.target instanceof HTMLElement ? event.target.tagName : "";
      if (["INPUT", "SELECT", "TEXTAREA"].includes(tag)) return;
      if (event.key === "ArrowLeft") moveCard(-1);
      else if (event.key === "ArrowRight") moveCard(1);
      // buttons already handle Space natively, so only flip when nothing else owns the key
      else if (event.code === "Space" && tag !== "BUTTON") {
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
    if (deck.length === 0) return;
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

  let body;
  if (loading) {
    body = <div className="fc-message"><span className="loader" /> Loading your flashcards…</div>;
  } else if (error) {
    body = <div className="fc-message fc-error" role="alert">{error}</div>;
  } else if (!card) {
    body = <div className="fc-message">There are no cards in this topic yet.</div>;
  } else {
    const counter = `${pad(cardIndex + 1)} / ${pad(deck.length)}`;
    if (!melodyAssignments.current.has(card.slug)) {
      melodyAssignments.current.set(card.slug, Math.floor(Math.random() * melodyImages.length));
    }
    const melodyIndex = melodyAssignments.current.get(card.slug);
    body = (
      <>
        {/* key remounts the card, so the next question never flashes its answer while flipping back */}
        <button
          key={card.slug}
          type="button"
          className={`fc-card ${flipped ? "is-flipped" : ""}`}
          onClick={() => setFlipped((current) => !current)}
        >
          <span className="fc-card-inner">
            <span className="fc-side fc-front" aria-hidden={flipped}>
              <span className="fc-meta">
                <span className="fc-topic">{card.topic}</span>
                <span className="fc-counter">{counter}</span>
                <img className={`fc-melody-thumb ${melodyIndex === 2 ? "is-checker" : ""}`} src={melodyImages[melodyIndex]} alt="" aria-hidden="true" />
              </span>
              <span className="fc-body">
                <span className="fc-label">Question</span>
                <span className="fc-text">{card.question}</span>
                {card.hint && <span className="fc-hint">Hint: {card.hint}</span>}
              </span>
              <span className="fc-foot">
                <span className="fc-source">Source: {card.source}</span>
                <span className="fc-cue">↻ Tap to reveal answer</span>
              </span>
            </span>

            <span className="fc-side fc-back" aria-hidden={!flipped}>
              <span className="fc-meta">
                <span className="fc-topic">{card.topic}</span>
                <span className="fc-counter">{counter}</span>
                <img className={`fc-melody-thumb ${melodyIndex === 2 ? "is-checker" : ""}`} src={melodyImages[melodyIndex]} alt="" aria-hidden="true" />
              </span>
              <span className="fc-body">
                <span className="fc-label">Answer</span>
                <span className="fc-text">{card.answer}</span>
              </span>
              <span className="fc-foot">
                <span className="fc-source">Source: {card.source}</span>
                <span className="fc-cue">↻ Tap to see question</span>
              </span>
            </span>
          </span>
        </button>

        <div className="fc-controls">
          <button type="button" className="fc-nav" onClick={() => moveCard(-1)} aria-label="Previous flashcard">←</button>
          <button
            type="button"
            className={`button fc-got-it ${isRemembered ? "button-remembered" : "button-primary"}`}
            disabled={!flipped}
            onClick={markRemembered}
          >
            {isRemembered ? "Got it ✓" : "Got it — next card"} <Icon name="arrow" size={17} />
          </button>
          <button type="button" className="fc-nav" onClick={() => moveCard(1)} aria-label="Next flashcard">→</button>
        </div>
        <div className="fc-disclaimer">For study review only. Follow your course and facility guidance.</div>
      </>
    );
  }

  return (
    <section className="fc-page" aria-labelledby="flashcard-title">
        <div className="quiz-top">
          <span className="quiz-brand"><span>n+</span> flashcard practice</span>
          <button className="modal-close" onClick={onClose} aria-label="Close flashcards"><Icon name="close" size={20} /></button>
        </div>

        <div className="fc-heading">
          <div className="section-kicker">A LITTLE PRACTICE GOES A LONG WAY</div>
          <h1 id="flashcard-title">Quick recall, stronger care.</h1>
          <p>Think of your answer, then flip the card to check.</p>
        </div>

        <div className="fc-toolbar">
          <label id="flashcard-topic-label">Study topic</label>
          <div className="fc-topic-picker" ref={topicPickerRef}>
            <button
              type="button"
              className="fc-topic-trigger"
              aria-labelledby="flashcard-topic-label"
              aria-haspopup="listbox"
              aria-expanded={topicOpen}
              onClick={() => setTopicOpen((open) => !open)}
              onKeyDown={(event) => {
                if (["ArrowDown", "Enter", " "].includes(event.key)) {
                  event.preventDefault();
                  setTopicOpen(true);
                }
              }}
            >
              <span>{topic}</span><span className="fc-topic-chevron" aria-hidden="true">⌄</span>
            </button>
            {topicOpen && (
              <div className="fc-topic-menu" role="listbox" aria-labelledby="flashcard-topic-label">
                {topicOptions.map((item, index) => (
                  <button
                    key={item}
                    ref={(node) => { topicOptionRefs.current[index] = node; }}
                    type="button"
                    role="option"
                    aria-selected={topic === item}
                    tabIndex={topic === item ? 0 : -1}
                    className={`fc-topic-option ${topic === item ? "selected" : ""}`}
                    onClick={() => {
                      changeTopic(item);
                      setTopicOpen(false);
                      topicPickerRef.current?.querySelector(".fc-topic-trigger")?.focus();
                    }}
                    onKeyDown={(event) => {
                      const currentIndex = topicOptions.indexOf(item);
                      const nextIndex = event.key === "ArrowDown" ? (currentIndex + 1) % topicOptions.length
                        : event.key === "ArrowUp" ? (currentIndex - 1 + topicOptions.length) % topicOptions.length
                          : event.key === "Home" ? 0 : event.key === "End" ? topicOptions.length - 1 : -1;
                      if (nextIndex >= 0) {
                        event.preventDefault();
                        topicOptionRefs.current[nextIndex]?.focus();
                      } else if (event.key === "Escape") {
                        event.preventDefault();
                        setTopicOpen(false);
                        topicPickerRef.current?.querySelector(".fc-topic-trigger")?.focus();
                      }
                    }}
                  >{item}</button>
                ))}
              </div>
            )}
          </div>
          {!loading && !error && (
            <span className={`fc-count ${allRemembered ? "is-complete" : ""}`}>
              {allRemembered ? "All remembered ✓" : `${rememberedCount} of ${deck.length} remembered`}
            </span>
          )}
        </div>

        {!loading && !error && card && (
          <div
            className="fc-progress"
            role="progressbar"
            aria-label="Cards remembered"
            aria-valuemin={0}
            aria-valuemax={deck.length}
            aria-valuenow={rememberedCount}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
        )}

        {body}
    </section>
  );
}
