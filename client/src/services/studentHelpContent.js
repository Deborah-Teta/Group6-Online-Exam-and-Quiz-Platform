import { ClipboardCheck, Clock, Send, ShieldCheck, Wifi } from "lucide-react";

export const helpTopics = [
  { label: "All questions", value: "all" },
  { label: "Classes", value: "classes" },
  { label: "Exams & quizzes", value: "assessments" },
  { label: "Results", value: "results" },
  { label: "Account", value: "account" },
];

export const helpQuestions = [
  {
    id: "join-class",
    topic: "classes",
    title: "How do I join a class?",
    content:
      "Go to My classes and choose Join a class. Enter the joining code your teacher shared with you, check that the class and teacher are correct, then choose Confirm & join class.",
  },
  {
    id: "code-not-working",
    topic: "classes",
    title: "Why isn't my joining code working?",
    content:
      "Check the code for typing mistakes. Capital letters don't matter, so that isn't the problem. If it still can't be found, ask your teacher to confirm the code.",
  },
  {
    id: "teacher-visibility",
    topic: "classes",
    title: "What can my teacher see after I join?",
    content: "Your teacher can see your name and your exam results for that class.",
  },
  {
    id: "exam-vs-quiz",
    topic: "assessments",
    title: "Are exams and quizzes different?",
    content:
      "They work the same way here. Both have a scheduled window, a countdown, one attempt and results that unlock after closing. You'll find them under My exams and My quizzes.",
  },
  {
    id: "when-to-start",
    topic: "assessments",
    title: "When can I start?",
    content:
      "You can only start while the scheduled window is open. Until then it shows as Upcoming. The rules appear first, and you need to accept them before you can start.",
  },
  {
    id: "starting-late",
    topic: "assessments",
    title: "What happens if I start late?",
    content:
      "Starting late does not extend the closing time. Your countdown shows the time left until it ends, so start as early in the window as you can.",
  },
  {
    id: "saving-answers",
    topic: "assessments",
    title: "Do I need to save my answers?",
    content:
      "No. Your answers save automatically each time you choose one. You can move between questions and change your answers until you submit.",
  },
  {
    id: "connection-problem",
    topic: "assessments",
    title: "What if the page stops working during an attempt?",
    content:
      "Reload the page. Your saved answers are kept and the countdown carries on. Time isn't added back, so tell your teacher straight away if the problem continues.",
  },
  {
    id: "time-runs-out",
    topic: "assessments",
    title: "What happens when time runs out?",
    content:
      "Your saved answers are submitted automatically, including any unanswered questions. Unanswered questions earn 0 points.",
  },
  {
    id: "retake",
    topic: "assessments",
    title: "Can I retake an exam or quiz?",
    content:
      "No. You have one attempt and one final submission. After you submit, you can't change your answers or start again.",
  },
  {
    id: "results-locked",
    topic: "results",
    title: "Why can't I see my score yet?",
    content:
      "Scores and correct answers stay locked until the exam or quiz closes for everyone, even if you submit early. You can still view your submission in the meantime.",
  },
  {
    id: "find-results",
    topic: "results",
    title: "Where do I find my results?",
    content:
      "Open Results in the menu. You can filter by exams or quizzes and by class, and see how your scores change over time.",
  },
  {
    id: "change-details",
    topic: "account",
    title: "How do I change my name or password?",
    content:
      "Open Settings at the bottom of the menu. You can update your full name and change your password there. If your email address needs to change, ask your school.",
  },
];

export const helpGuidelines = [
  {
    icon: Clock,
    title: "Check the schedule",
    text: "Note when each window opens and closes, and start early enough to use your full time.",
  },
  {
    icon: Wifi,
    title: "Prepare before you start",
    text: "Use a charged device with a steady connection, somewhere you won't be interrupted.",
  },
  {
    icon: ClipboardCheck,
    title: "Answer every question",
    text: "Unanswered questions earn 0 points, so use the question numbers to check for any you missed.",
  },
  {
    icon: Send,
    title: "Submit when you're sure",
    text: "Submission is final. Review your answers first, because you won't be able to return to them.",
  },
  {
    icon: ShieldCheck,
    title: "Do your own work",
    text: "Your answers should be your own. Check with your teacher about what you're allowed to use.",
  },
];
