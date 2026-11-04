// Temporary browser-only store for exam attempts, until the API is ready.
const storageKey = (examId) => `examAttempt:${examId}`;

export const loadAttempt = (examId) =>
  JSON.parse(sessionStorage.getItem(storageKey(examId)));

const saveAttempt = (examId, attempt) =>
  sessionStorage.setItem(storageKey(examId), JSON.stringify(attempt));

export const startAttempt = (examId, durationMinutes) => {
  const attempt = {
    deadline: Date.now() + durationMinutes * 60 * 1000,
    answers: {},
    savedAt: null,
    submittedAt: null,
  };

  saveAttempt(examId, attempt);
  return attempt;
};

export const recordAnswer = (examId, attempt, questionId, optionIndex) => {
  const nextAttempt = {
    ...attempt,
    answers: { ...attempt.answers, [questionId]: optionIndex },
    savedAt: Date.now(),
  };

  saveAttempt(examId, nextAttempt);
  return nextAttempt;
};

export const submitAttempt = (examId) =>
  saveAttempt(examId, { ...loadAttempt(examId), submittedAt: Date.now() });
