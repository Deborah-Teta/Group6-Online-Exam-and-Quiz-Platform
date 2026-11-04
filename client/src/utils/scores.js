export const formatPercent = (value) => `${value}%`;

export const averageScore = (exams) =>
  Math.round(exams.reduce((total, exam) => total + exam.score, 0) / exams.length);
