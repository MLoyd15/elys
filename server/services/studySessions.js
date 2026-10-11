export function startOfStudyWeek(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = start.getUTCDay() || 7;
  start.setUTCDate(start.getUTCDate() - day + 1);
  return start;
}

export function getWeeklyStudySeconds(sessions, now = new Date()) {
  const weekStart = startOfStudyWeek(now).getTime();
  const endOfRange = now.getTime();
  return sessions.reduce((total, session) => {
    const start = Math.max(new Date(session.startedAt).getTime(), weekStart);
    const end = Math.min(session.endedAt ? new Date(session.endedAt).getTime() : endOfRange, endOfRange);
    return total + Math.max(0, Math.floor((end - start) / 1000));
  }, 0);
}

export function serializeStudySession(session, now = new Date()) {
  const startedAt = new Date(session.startedAt);
  const endedAt = session.endedAt ? new Date(session.endedAt) : null;
  return {
    id: session._id.toString(),
    startedAt: startedAt.toISOString(),
    endedAt: endedAt?.toISOString() || null,
    durationSeconds: endedAt
      ? session.durationSeconds
      : Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 1000)),
  };
}
