import { lazy, Suspense } from "react";
import AddTask from "./AddTask.jsx";
import Notepad from "./Notepad.jsx";
import { Icon } from "../icons.jsx";

const PdfToText = lazy(() => import("./PdfToText.jsx"));

export default function DashboardPages({
  activeNav,
  todayLabel,
  dashboard,
  taskStats,
  reviewStats,
  studyState,
  actions,
}) {
  const { tasks, progress } = dashboard;
  const { unfinishedTasks, completedTasks } = taskStats;
  const {
    completedStudyQuizzes,
    completedReviewCount,
    reviewPathLength,
    reviewCompletionPercent,
  } = reviewStats;
  const {
    studyGuides,
    studyGuidesLoading,
    studyGuidesError,
    reviewedGuideCount,
    reviewedGuideSlugs,
    nextGuideSlug,
  } = studyState;

  return (
    <>
      {activeNav === "home" && (
        <>
          <section className="welcome-row overview-welcome">
            <div>
              <div className="eyebrow">{todayLabel} <span className="tiny-sun">✳</span></div>
              <h1>Your review, at a glance <span className="wave">✋</span></h1>
              <p className="welcome-subtitle">Welcome back, Elys. Here’s how your road to topnotcher is going.</p>
            </div>
            <div className="overview-date-pill"><Icon name="chart" size={17} /> Review statistics</div>
          </section>
          <section className="review-stats-grid" aria-label="Review statistics">
            <article className="review-stat-card review-stat-green">
              <span className="review-stat-icon"><Icon name="book" size={20} /></span>
              <span className="review-stat-label">CCN QUIZZES COMPLETED</span>
              <strong>{completedReviewCount}<small> / {reviewPathLength}</small></strong>
              <span className="review-stat-note">study-unit quizzes passed</span>
            </article>
            <article className="review-stat-card review-stat-pink">
              <span className="review-stat-icon"><Icon name="spark" size={20} /></span>
              <span className="review-stat-label">TOTAL XP</span>
              <strong>{progress.xp}</strong>
              <span className="review-stat-note">points earned from practice</span>
            </article>
            <article className="review-stat-card review-stat-pink">
              <span className="review-stat-icon"><Icon name="clock" size={20} /></span>
              <span className="review-stat-label">STUDY TIME THIS WEEK</span>
              <strong>{progress.weeklyMinutes}<small> min</small></strong>
              <span className="review-stat-note">time spent reviewing</span>
            </article>
            <article className="review-stat-card review-stat-green">
              <span className="review-stat-icon"><Icon name="flame" size={20} /></span>
              <span className="review-stat-label">CURRENT STREAK</span>
              <strong>{progress.streak}<small> days</small></strong>
              <span className="review-stat-note">keep showing up for yourself</span>
            </article>
          </section>
          <section className="overview-review-card">
            <div className="overview-review-heading">
              <div>
                <div className="section-kicker">YOUR CCN REVIEW</div>
                <h2>Road to topnotcher</h2>
                <p>Quiz completion across your six study units.</p>
              </div>
              <strong>{reviewCompletionPercent}%</strong>
            </div>
            <div className="overview-progress-track">
              <span style={{ width: `${reviewCompletionPercent}%` }} />
            </div>
            <div className="overview-unit-list">
              {studyGuides.map((guide, index) => {
                const completed = completedStudyQuizzes.includes(guide.slug);
                return (
                  <div className="overview-unit-row" key={guide.slug}>
                    <span className={`overview-unit-number ${completed ? "is-complete" : ""}`}>
                      {completed ? "✓" : String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="overview-unit-name">{guide.topic}</span>
                    <span className={`overview-unit-status ${completed ? "is-complete" : ""}`}>
                      {completed ? "Quiz completed" : "Not completed yet"}
                    </span>
                  </div>
                );
              })}
              {!studyGuidesLoading && studyGuides.length === 0 && studyGuidesError && (
                <div className="overview-units-error" role="alert">
                  {studyGuidesError}
                  <button className="text-button" onClick={actions.loadStudyGuides}>Try again</button>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {activeNav === "path" && (
        <section className="lesson-section study-path-section" id="study-path-section">
          <div className="section-heading">
            <div>
              <div className="section-kicker">YOUR LEARNING PATH</div>
              <h2>Study it, then remember it</h2>
              <p>Choose a CCN unit to open its reading guide, then review matching flashcards in the Study Room.</p>
            </div>
            <span className="path-progress-pill">{reviewedGuideCount} / {studyGuides.length || 6} reviewed</span>
          </div>
          {studyGuidesError ? (
            <div className="path-load-error" role="alert">
              <span>{studyGuidesError}</span>
              <button className="text-button" onClick={actions.loadStudyGuides}>Try again <Icon name="arrow" size={16} /></button>
            </div>
          ) : studyGuidesLoading ? (
            <div className="path-loading"><span className="loader" /> Loading your study units…</div>
          ) : (
            <div className="study-path-grid">
              {studyGuides.map((guide, index) => {
                const isReviewed = reviewedGuideSlugs.includes(guide.slug);
                const isNext = guide.slug === nextGuideSlug;
                return (
                  <article className={`study-path-card ${isReviewed ? "is-reviewed" : ""} ${isNext ? "is-next" : ""}`} key={guide.slug}>
                    <div className="study-path-card-top">
                      <span className="study-path-number">{String(index + 1).padStart(2, "0")}</span>
                      <span className={`study-path-status ${isReviewed ? "is-reviewed" : ""}`}>
                        {isReviewed ? "✓ REVIEWED" : isNext ? "UP NEXT" : "READY WHEN YOU ARE"}
                      </span>
                    </div>
                    <div className="study-path-topic">{guide.topic}</div>
                    <h3>{guide.title}</h3>
                    <p>{guide.introduction}</p>
                    <div className="study-path-card-footer">
                      <span><Icon name="clock" size={15} />{guide.readTime}</span>
                      <button
                        className="study-path-action"
                        onClick={() => actions.openStudyRoom(guide.slug)}
                        aria-label={`${isReviewed ? "Review" : "Study"} ${guide.topic}`}
                      >
                        {isReviewed ? "Review unit" : "Study unit"} <Icon name="arrow" size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeNav === "quiz" && (
        <section className="lesson-section quiz-practice-section" id="lessons-section">
          <div className="section-heading">
            <div>
              <div className="section-kicker">QUICK QUIZ PRACTICE</div>
              <h2>Test what you know</h2>
              <p>Take the same 10-question CCN quizzes available beside the flashcards in each Study Room unit.</p>
            </div>
          </div>
          {studyGuidesError ? (
            <div className="path-load-error" role="alert">
              <span>{studyGuidesError}</span>
              <button className="text-button" onClick={actions.loadStudyGuides}>Try again <Icon name="arrow" size={16} /></button>
            </div>
          ) : studyGuidesLoading ? (
            <div className="path-loading"><span className="loader" /> Loading your quizzes…</div>
          ) : (
            <div className="lesson-grid">
              {studyGuides.map((guide, index) => (
                <article className={`lesson-card study-quiz-card ${index % 2 === 0 ? "mint" : "peach"}`} key={guide.slug}>
                  <div className="lesson-topline">
                    <span className={`lesson-icon ${index % 2 === 0 ? "mint" : "peach"}`}>📘</span>
                    <span className="lesson-status">10 QUESTIONS</span>
                  </div>
                  <div className="lesson-category">{guide.topic}</div>
                  <h3>{guide.title}</h3>
                  <p>Check your understanding with the Study Room quiz for this unit.</p>
                  <div className="lesson-footer">
                    <span><Icon name="clock" size={15} />10 questions</span>
                    <button
                      className="lesson-action"
                      onClick={() => actions.startStudyGuideQuiz(guide.slug)}
                      aria-label={`Take ${guide.topic} quiz`}
                    >
                      <Icon name="arrow" size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {(activeNav === "check" || activeNav === "chart") && (
        <div className="bottom-grid single-panel-grid">
          {activeNav === "check" && (
            <section className="todo-card" id="todo-section">
              <div className="todo-header">
                <div>
                  <div className="section-kicker">STAY ON TRACK</div>
                  <h2>Today’s to-dos <span className="todo-total">{unfinishedTasks.length}</span></h2>
                </div>
                <AddTask onAdd={actions.addTask} />
              </div>
              {tasks.length === 0 ? (
                <div className="empty-tasks"><span>🌱</span><p>Nothing on your list yet. Add a little goal to get started.</p></div>
              ) : (
                <div className="task-list">
                  {tasks.map((task) => (
                    <div className={`task-row ${task.completed ? "task-complete" : ""}`} key={task.id}>
                      <button
                        className={`task-check ${task.completed ? "checked" : ""}`}
                        onClick={() => actions.toggleTask(task)}
                        aria-label={`${task.completed ? "Mark incomplete" : "Complete"} ${task.title}`}
                      >
                        {task.completed && "✓"}
                      </button>
                      <span className="task-title">{task.title}</span>
                      <span className="task-due">{task.dueLabel}</span>
                      <button
                        className="task-delete"
                        onClick={() => actions.removeTask(task.id)}
                        aria-label={`Delete ${task.title}`}
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="todo-summary">
                <span className="summary-check">✓</span>
                {completedTasks === 0
                  ? "You’ve got this — one task at a time."
                  : `${completedTasks} of ${tasks.length} tasks complete. Nice work!`}
              </div>
            </section>
          )}

          {activeNav === "chart" && (
            <section className="progress-card" id="progress-card">
              <div className="section-kicker">YOUR MOMENTUM</div>
              <h2>Look at you go.</h2>
              <p>Every little session adds up.</p>
              <div className="progress-ring-wrap">
                <svg className="progress-ring" width="130" height="130" viewBox="0 0 130 130" aria-label={`${completedReviewCount} of ${reviewPathLength} CCN quizzes complete`}>
                  <circle cx="65" cy="65" r="54" fill="none" stroke="#edf0e9" strokeWidth="10" />
                  <circle
                    cx="65"
                    cy="65"
                    r="54"
                    fill="none"
                    stroke="#57a87a"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.max(completedReviewCount / reviewPathLength, 0.03) * 339} 339`}
                    transform="rotate(-90 65 65)"
                  />
                </svg>
                <div className="ring-text"><strong>{reviewCompletionPercent}<small>%</small></strong><span>of CCN quizzes</span></div>
                <span className="ring-leaf">✳</span>
              </div>
              <div className="progress-stats">
                <div><span className="stat-icon xp-mini">✳</span><strong>{progress.xp}</strong><small>Total XP</small></div>
                <div><span className="stat-icon streak-mini">↗</span><strong>{progress.streak} days</strong><small>Current streak</small></div>
              </div>
              <div className="progress-review-count">{completedReviewCount} of {reviewPathLength} CCN unit quizzes completed</div>
            </section>
          )}
        </div>
      )}

      <Notepad active={activeNav === "notes"} />
      {activeNav === "pdf" && (
        <Suspense fallback={<div className="pdf-conversion-status" role="status">Loading PDF tools…</div>}>
          <PdfToText />
        </Suspense>
      )}
      <footer className="page-footer">Made for the nurse you’re becoming <span>✳</span></footer>
    </>
  );
}
