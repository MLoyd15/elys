import { randomBytes } from "node:crypto";

function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validString(value, maxLength = 2000) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

function validStringArray(value, minimum, maximum) {
  return Array.isArray(value)
    && value.length >= minimum
    && value.length <= maximum
    && value.every((item) => validString(item, 1000));
}

export function buildStudyGuide(generatedText, fileName, sourceText) {
  let generated;
  try {
    generated = JSON.parse(generatedText);
  } catch {
    console.error("Gemini returned invalid JSON for generated study materials.");
    throw createError("Gemini returned an unreadable response. Please try again.", 502);
  }

  const validSections = Array.isArray(generated.sections)
    && generated.sections.length >= 3
    && generated.sections.length <= 5
    && generated.sections.every((section) =>
      section && validString(section.title, 160) && validString(section.body) && validStringArray(section.bullets, 2, 4),
    );
  const validCards = Array.isArray(generated.flashcards)
    && generated.flashcards.length === 12
    && generated.flashcards.every((card) =>
      card && validString(card.question, 500) && validString(card.answer, 1000) && validString(card.hint, 500),
    );
  const validQuiz = Array.isArray(generated.quiz)
    && generated.quiz.length === 10
    && generated.quiz.every((question) =>
      question
      && validString(question.prompt, 800)
      && validStringArray(question.options, 4, 4)
      && Number.isInteger(question.answer)
      && question.answer >= 0
      && question.answer < 4
      && validString(question.explanation, 1200),
    );

  if (
    !validString(generated.topic, 100)
    || !validString(generated.title, 160)
    || !validString(generated.introduction)
    || !validStringArray(generated.objectives, 3, 5)
    || !validSections
    || !validString(generated.reflection)
    || !validString(generated.safetyNote)
    || !validCards
    || !validQuiz
  ) {
    console.error("Gemini response did not match the required study-material structure.");
    throw createError("Gemini returned incomplete study materials. Please try again.", 502);
  }

  const safeFileName = fileName.split(/[\\/]/).pop().replace(/[<>:"|?*\x00-\x1f]/g, "").slice(0, 150) || "uploaded PDF";
  const slugBase = generated.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "pdf-study";
  const slug = `${slugBase}-${randomBytes(4).toString("hex")}`;
  const wordCount = sourceText.split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 220));
  const sourceLabel = fileName === "Pasted text" ? "Pasted text" : "PDF";
  const guide = {
    slug,
    topic: generated.topic.trim(),
    source: `${sourceLabel}: ${safeFileName}`,
    readTime: `${readMinutes} min read`,
    title: generated.title.trim(),
    introduction: generated.introduction.trim(),
    objectives: generated.objectives.map((objective) => objective.trim()),
    sections: generated.sections.map((section) => ({
      title: section.title.trim(),
      body: section.body.trim(),
      bullets: section.bullets.map((bullet) => bullet.trim()),
    })),
    quiz: generated.quiz.map((question) => ({
      prompt: question.prompt.trim(),
      options: question.options.map((option) => option.trim()),
      answer: question.answer,
      explanation: question.explanation.trim(),
    })),
    reflection: generated.reflection.trim(),
    safetyNote: generated.safetyNote.trim(),
  };
  const flashcards = generated.flashcards.map((card, index) => ({
    slug: `${slug}-card-${index + 1}`,
    studyGuideSlug: slug,
    topic: guide.topic,
    source: guide.source,
    question: card.question.trim(),
    answer: card.answer.trim(),
    hint: card.hint.trim(),
  }));

  return { guide, flashcards };
}
