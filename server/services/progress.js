export async function awardProgress(progress, {
  completionField,
  slug,
  earnedXp,
}) {
  const today = new Date().toISOString().slice(0, 10);
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
  await progress.save();

  return { awardedXp, isFirstCompletion };
}
