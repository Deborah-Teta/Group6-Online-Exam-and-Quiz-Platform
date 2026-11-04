import {
  ChartNoAxesCombined,
  CircleHelp,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  Users,
} from "lucide-react";
import { mockStudent } from "../services/studentMockData";

export const studentNavigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/student/dashboard",
    title: `Ready when you are, ${mockStudent.name.split(" ")[0]}.`,
    description: "Your classes and exams, all in one place.",
  },
  {
    label: "My classes",
    icon: Users,
    href: "/student/classes",
    description: "The classes you've joined and how each one is going.",
  },
  {
    label: "My exams",
    icon: ClipboardList,
    href: "/student/exams",
    description: "Every exam from your classes, and what you can do next.",
  },
  {
    label: "My quizzes",
    icon: ListChecks,
    href: "/student/quizzes",
    description: "Every quiz from your classes, and what you can do next.",
  },
  {
    label: "Results",
    icon: ChartNoAxesCombined,
    href: "/student/results",
    description: "Your scores from exams and quizzes, and how they're changing over time.",
  },
];

export const studentSupportNavigation = [
  {
    label: "Help & guidelines",
    icon: CircleHelp,
    href: "/student/help",
    description: "How your exams and quizzes work, and what to do if something goes wrong.",
  },
];

// Pages reached from another page, so they have a header but no sidebar link.
export const studentSubPages = [
  {
    label: "Find your classroom",
    href: "/student/classes/join",
    description: "Enter the joining code your teacher shared with you.",
  },
  {
    label: "Before you begin",
    href: "/student/exams/:examId/instructions",
    description: "Read the rules, then start when you're ready.",
  },
  {
    label: "Exam in progress",
    href: "/student/exams/:examId/attempt",
    description: "Your answers save automatically.",
  },
  {
    label: "Submission received",
    href: "/student/exams/:examId/submitted",
    description: "Your attempt has been submitted.",
  },
  {
    label: "Before you begin",
    href: "/student/quizzes/:examId/instructions",
    description: "Read the rules, then start when you're ready.",
  },
  {
    label: "Quiz in progress",
    href: "/student/quizzes/:examId/attempt",
    description: "Your answers save automatically.",
  },
  {
    label: "Submission received",
    href: "/student/quizzes/:examId/submitted",
    description: "Your attempt has been submitted.",
  },
];
