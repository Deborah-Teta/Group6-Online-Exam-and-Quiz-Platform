// Temporary mock data for the student portal, until the API is ready.
export const mockStudent = {
  name: "Maya Patel",
  initials: "MP",
  role: "Student",
  school: "Oakfield Academy",
  academicYear: "2026–27",
};

export const mockEnrolledClasses = [
  {
    id: "biology-10a",
    name: "Biology 10A",
    teacher: "Dr. Sarah Morgan",
    joinedOn: "8 Sep 2026",
  },
  {
    id: "science-enrichment",
    name: "Science enrichment",
    teacher: "Alex Moore",
    joinedOn: "12 Sep 2026",
  },
];

// Every class a joining code can find, whether or not the student is in it yet.
export const mockAvailableClasses = [
  {
    id: "biology-10a",
    code: "BIO10A",
    name: "Biology 10A",
    description: "Year 10 · Biology",
    teacher: "Dr. Sarah Morgan",
  },
  {
    id: "science-enrichment",
    code: "SCI10E",
    name: "Science enrichment",
    description: "Year 10 · Science",
    teacher: "Alex Moore",
  },
  {
    id: "chemistry-10b",
    code: "CHEM10B",
    name: "Chemistry 10B",
    description: "Year 10 · Chemistry",
    teacher: "Priya Nair",
  },
];

export const mockNextExamNote = "Your next exam is tomorrow at 11:00";

export const mockExams = [
  {
    id: "cell-biology-checkpoint",
    title: "Cell Biology Checkpoint",
    details: "5 questions · 30 minutes · 10 points",
    className: "Biology 10A",
    schedule: "Today · 10:00–10:30",
    closesAt: "10:30",
    status: "open",
    statusLabel: "Open now",
  },
  {
    id: "cell-transport-quiz",
    title: "Cell Transport Quiz",
    className: "Biology 10A",
    schedule: "30 Oct · 11:00–11:20",
    status: "upcoming",
    statusLabel: "Upcoming",
    availability: "Opens tomorrow",
  },
  {
    id: "scientific-method",
    title: "Scientific Method",
    className: "Science enrichment",
    schedule: "2 Nov · 15:30–15:50",
    status: "upcoming",
    statusLabel: "Upcoming",
    availability: "Not yet open",
  },
  {
    id: "microscopy-basics",
    title: "Microscopy Basics",
    className: "Biology 10A",
    schedule: "22 Oct · 10:00–10:20",
    date: "22 Oct",
    score: 91,
    status: "closed",
    statusLabel: "Closed · Attempted",
  },
  {
    id: "hypothesis-testing",
    title: "Hypothesis Testing",
    className: "Science enrichment",
    schedule: "15 Oct · 15:30–15:50",
    date: "15 Oct",
    score: 75,
    status: "closed",
    statusLabel: "Closed · Attempted",
  },
  {
    id: "organelles-quiz",
    title: "Organelles Quiz",
    className: "Biology 10A",
    schedule: "9 Oct · 11:00–11:20",
    date: "9 Oct",
    score: 74,
    status: "closed",
    statusLabel: "Closed · Attempted",
  },
  {
    id: "measuring-and-data",
    title: "Measuring and Data",
    className: "Science enrichment",
    schedule: "2 Oct · 15:30–15:50",
    date: "2 Oct",
    score: 70,
    status: "closed",
    statusLabel: "Closed · Attempted",
  },
  {
    id: "cell-structure",
    title: "Cell Structure",
    className: "Biology 10A",
    schedule: "25 Sep · 10:00–10:30",
    date: "25 Sep",
    score: 78,
    status: "closed",
    statusLabel: "Closed · Attempted",
  },
  {
    id: "lab-safety",
    title: "Lab Safety",
    className: "Science enrichment",
    schedule: "18 Sep · 15:30–15:50",
    date: "18 Sep",
    score: 62,
    status: "closed",
    statusLabel: "Closed · Attempted",
  },
];
