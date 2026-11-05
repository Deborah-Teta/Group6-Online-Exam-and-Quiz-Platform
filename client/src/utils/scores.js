export const formatPercent = (value) => `${value}%`;

export const averageScore = (exams) =>
  exams.length
    ? Math.round(exams.reduce((total, exam) => total + exam.score, 0) / exams.length)
    : 0;
