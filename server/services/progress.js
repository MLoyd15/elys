export async function awardProgress(progress, {
  completionField,
  slug,
  earnedXp,
  minutes,
}) {
  const today = new Date().toISOString().slice(0, 10);
  const date = new Date();
  const dayOfWeek = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - dayOfWeek + 1);
  const weekStart = date.toISOString().slice(0, 10);
  const yesterdayDate = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const completed = progress[completionField];
  const isFirstCompletion = !completed.includes(slug);
  const awardedXp = isFirstCompletion ? earnedXp : Math.floor(earnedXp / 2);

  progress.xp += awardedXp;
  if (isFirstCompletion) completed.push(slug);
  if (progress.lastStudyDate !== today) {
    progress.streak = progress.lastStudyDate === yesterdayDate ? progress.streak + 1 : 1;
    progress.lastStudyDate = today;
  }
  if (progress.weekStart !== weekStart) {
    progress.weeklyMinutes = 0;
    progress.weekStart = weekStart;
  }
  progress.weeklyMinutes += minutes;
  await progress.save();

  return { awardedXp, isFirstCompletion };
}
