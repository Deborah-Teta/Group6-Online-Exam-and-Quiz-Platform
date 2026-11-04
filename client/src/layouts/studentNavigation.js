import {
  ChartNoAxesCombined,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  Users,
} from "lucide-react";

export const studentNavigation = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/student/dashboard" },
  { label: "My classes", icon: Users, href: "/student/classes" },
  { label: "My exams", icon: ClipboardList, href: "/student/exams" },
  { label: "My quizzes", icon: ListChecks, href: "/student/quizzes" },
  { label: "Results", icon: ChartNoAxesCombined, href: "/student/results" },
];

// Pages reached from another page, so they have a breadcrumb but no sidebar link.
export const studentSubPages = [
  { label: "Join class", href: "/student/classes/join" },
];
