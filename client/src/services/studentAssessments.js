import {
  mockExamQuestions,
  mockExams,
  mockNextExamNote,
  mockNextQuizNote,
  mockQuizQuestions,
  mockQuizzes,
} from "./studentMockData";

// Exams and quizzes share one workflow, so each page reads its wording and data from here.
export const assessmentTypes = {
  exam: {
    noun: "exam",
    nounTitle: "Exam",
    plural: "exams",
    pluralTitle: "Exams",
    basePath: "/student/exams",
    items: mockExams,
    questions: mockExamQuestions,
    nextNote: mockNextExamNote,
  },
  quiz: {
    noun: "quiz",
    nounTitle: "Quiz",
    plural: "quizzes",
    pluralTitle: "Quizzes",
    basePath: "/student/quizzes",
    items: mockQuizzes,
    questions: mockQuizQuestions,
    nextNote: mockNextQuizNote,
  },
};
