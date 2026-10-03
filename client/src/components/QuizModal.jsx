import { useState } from "react";
import { Icon } from "../icons.jsx";

export default function QuizModal({ lesson, onClose, onSubmit }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const question = lesson.questions[questionIndex];
  const isLast = questionIndex === lesson.questions.length - 1;

  async function next() {
    if (!checked) {
      setChecked(true);
      return;
    }
    const nextAnswers = [...answers, selected];
    if (!isLast) {
      setAnswers(nextAnswers);
      setQuestionIndex((index) => index + 1);
      setSelected(null);
      setChecked(false);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      setResult(await onSubmit(lesson, nextAnswers));
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !result) onClose(); }}>
    <section className="quiz-modal" role="dialog" aria-modal="true" aria-labelledby="quiz-title">
      <div className="quiz-top"><span className="quiz-brand"><span>n+</span> nurselys</span><button className="modal-close" onClick={onClose} aria-label="Close lesson"><Icon name="close" size={20} /></button></div>
      {result ? <div className="quiz-result"><div className="result-art">{result.correct === result.total ? "🌟" : "🌱"}</div><div className="section-kicker">LESSON COMPLETE</div><h2>{result.correct === result.total ? "A perfect round!" : "Look at you learning."}</h2><p>You got <strong>{result.correct} of {result.total}</strong> questions right. Every practice round makes you stronger.</p><div className="earned-xp">✳ &nbsp;+{result.earnedXp} XP</div><button className="button button-primary" onClick={onClose}>Back to my path <Icon name="arrow" size={17} /></button></div> : <>
        <div className="quiz-progress-heading"><span>{lesson.category}</span><span>Question {questionIndex + 1} of {lesson.questions.length}</span></div>
        <div className="quiz-progress-track"><span style={{ width: `${((questionIndex + 1) / lesson.questions.length) * 100}%` }} /></div>
        <div className="quiz-content"><div className="quiz-lesson-icon">{lesson.icon}</div><h1 id="quiz-title">{question.prompt}</h1><div className="answer-options">{question.options.map((option, index) => <button key={option} disabled={checked} className={`answer-option ${selected === index ? "selected" : ""} ${checked && index === question.answer ? "answer-correct" : ""} ${checked && selected === index && selected !== question.answer ? "answer-incorrect" : ""}`} onClick={() => setSelected(index)}><span className="option-letter">{checked && index === question.answer ? "✓" : String.fromCharCode(65 + index)}</span>{option}</button>)}</div>{checked && <div className={`answer-feedback ${selected === question.answer ? "feedback-correct" : "feedback-incorrect"}`}><strong>{selected === question.answer ? "That’s right!" : "Not quite — here’s why."}</strong><span>{question.explanation}</span></div>}{error && <div className="quiz-error" role="alert">{error}</div>}</div>
        <div className="quiz-footer"><span className="quiz-encourage">Take your time. You’ve got this ✨</span><button className="button button-primary" disabled={selected === null || submitting} onClick={next}>{submitting ? "Checking…" : checked ? (isLast ? "Finish lesson" : "Next question") : "Check answer"} <Icon name="arrow" size={17} /></button></div>
      </>}
    </section>
  </div>;
}
