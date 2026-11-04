import { mockStudent } from "../services/studentMockData";

// What the shared Navbar shows for each student page.
export const studentPageHeaders = [
  {
    href: "/student/dashboard",
    title: `Welcome back, ${mockStudent.name.split(" ")[0]}!`,
    description: "Student Workspace • Online Exam & Quiz Platform",
  },
  {
    href: "/student/classes/join",
    title: "Find your classroom",
    description: "Enter the joining code your teacher shared with you.",
  },
  {
    href: "/student/classes",
    title: "My classes",
    description: "The classes you've joined and how each one is going.",
  },
  {
    href: "/student/exams/:examId/instructions",
    title: "Before you begin",
    description: "Read the rules, then start when you're ready.",
  },
  {
    href: "/student/exams/:examId/attempt",
    title: "Exam in progress",
    description: "Your answers save automatically.",
  },
  {
    href: "/student/exams/:examId/submitted",
    title: "Submission received",
    description: "Your attempt has been submitted.",
  },
  {
    href: "/student/exams",
    title: "My exams",
    description: "Every exam from your classes, and what you can do next.",
  },
  {
    href: "/student/quizzes/:examId/instructions",
    title: "Before you begin",
    description: "Read the rules, then start when you're ready.",
  },
  {
    href: "/student/quizzes/:examId/attempt",
    title: "Quiz in progress",
    description: "Your answers save automatically.",
  },
  {
    href: "/student/quizzes/:examId/submitted",
    title: "Submission received",
    description: "Your attempt has been submitted.",
  },
  {
    href: "/student/quizzes",
    title: "My quizzes",
    description: "Every quiz from your classes, and what you can do next.",
  },
  {
    href: "/student/results",
    title: "Results",
    description: "Your scores from exams and quizzes, and how they're changing over time.",
  },
  {
    href: "/student/help",
    title: "Help & guidelines",
    description: "How your exams and quizzes work, and what to do if something goes wrong.",
  },
];
