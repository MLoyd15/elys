import { Icon } from "../icons.jsx";
import "../styles/progress-page.css";

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export default function ProgressPage({
  guides,
  loading,
  error,
  completedSlugs,
  xp,
  streak,
  weeklyMinutes,
  onStartQuiz,
  onReload,
}) {
  const total = guides.length;
  // count only slugs that still exist, so the total can never exceed 100%
  const completedCount = guides.filter((guide) => completedSlugs.includes(guide.slug)).length;
  const percent = total ? Math.round((completedCount / total) * 100) : 0;
  const nextGuide = guides.find((guide) => !completedSlugs.includes(guide.slug));
  const allDone = total > 0 && !nextGuide;

  let headline = "Your progress starts here.";
  let summary = "Take a study-unit quiz and your results will show up on this page.";
  if (allDone) {
    headline = "Every unit quiz is complete.";
    summary = "Retake any unit below to keep the material fresh.";
  } else if (completedCount > 0) {
    headline = `${completedCount} of ${total} unit quizzes done.`;
    summary = nextGuide ? `Next up: ${nextGuide.topic}.` : "";
  }

  return (
    <div className="pg-root">
      <section className="pg-card pg-hero" aria-label="Quiz completion">
        <div className="pg-hero-copy">
          <div className="section-kicker">YOUR MOMENTUM</div>
          <h2>{headline}</h2>
          <p>{summary}</p>
          {nextGuide && (
            <button className="button button-primary pg-cta" onClick={() => onStartQuiz(nextGuide.slug)}>
              {completedCount === 0 ? "Start with " : "Continue with "}{nextGuide.topic} <Icon name="arrow" size={16} />
            </button>
          )}
        </div>
        <div
          className="pg-ring"
          role="img"
          aria-label={`${completedCount} of ${total} study-unit quizzes complete`}
        >
          <svg viewBox="0 0 130 130" aria-hidden="true">
            <defs>
              <linearGradient id="pg-ring-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4f9c71" />
                <stop offset="100%" stopColor="#d87594" />
              </linearGradient>
            </defs>
            <circle cx="65" cy="65" r={RING_RADIUS} className="pg-ring-track" />
            {percent > 0 && (
              <circle
                cx="65"
                cy="65"
                r={RING_RADIUS}
                className="pg-ring-value"
                strokeDasharray={`${(percent / 100) * RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
                transform="rotate(-90 65 65)"
              />
            )}
          </svg>
          <div className="pg-ring-text">
            <strong>{percent}<small>%</small></strong>
            <span>{completedCount} of {total || "–"} units</span>
          </div>
        </div>
      </section>

      <section className="pg-stats" aria-label="Study statistics">
        <article className="pg-card pg-stat pg-stat-pink">
          <span className="pg-stat-icon"><Icon name="spark" size={20} /></span>
          <span className="pg-stat-label">Total XP</span>
          <strong>{xp}</strong>
          <span className="pg-stat-note">earned from quiz practice</span>
        </article>
        <article className="pg-card pg-stat pg-stat-green">
          <span className="pg-stat-icon"><Icon name="flame" size={20} /></span>
          <span className="pg-stat-label">Current streak</span>
          <strong>{streak}<small> {streak === 1 ? "day" : "days"}</small></strong>
          <span className="pg-stat-note">consecutive study days</span>
        </article>
        <article className="pg-card pg-stat pg-stat-pink">
          <span className="pg-stat-icon"><Icon name="clock" size={20} /></span>
          <span className="pg-stat-label">Study time this week</span>
          <strong>{weeklyMinutes}<small> min</small></strong>
          <span className="pg-stat-note">time spent reviewing</span>
        </article>
      </section>

      <section className="pg-card pg-units" aria-label="Study units">
        <div className="pg-units-heading">
          <h3>Unit quizzes</h3>
          {total > 0 && <span>{plural(completedCount, "unit")} complete</span>}
        </div>
        {error ? (
          <div className="pg-state pg-state-error" role="alert">
            <span>{error}</span>
            <button className="text-button" onClick={onReload}>Try again <Icon name="arrow" size={16} /></button>
          </div>
        ) : loading ? (
          <div className="pg-state" role="status"><span className="loader" /> Loading your units…</div>
        ) : total === 0 ? (
          <div className="pg-state">No study units yet. Create one from the AI Guide.</div>
        ) : (
          <ul className="pg-unit-list">
            {guides.map((guide, index) => {
              const done = completedSlugs.includes(guide.slug);
              const isNext = !done && guide.slug === nextGuide?.slug;
              return (
                <li className={`pg-unit ${done ? "is-done" : ""} ${isNext ? "is-next" : ""}`} key={guide.slug}>
                  <span className="pg-unit-badge" aria-hidden="true">{done ? "✓" : index + 1}</span>
                  <span className="pg-unit-copy">
                    <strong>{guide.topic}</strong>
                    <small>{done ? "Quiz completed" : isNext ? "Up next" : "Not completed yet"}</small>
                  </span>
                  <button
                    className="pg-unit-action"
                    onClick={() => onStartQuiz(guide.slug)}
                    aria-label={`${done ? "Retake" : "Take"} ${guide.topic} quiz`}
                  >
                    {done ? "Retake" : "Take quiz"} <Icon name="arrow" size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}