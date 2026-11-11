const API_BASE = "/api";

async function studentRequest(path, { method = "GET", body } = {}) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error("Could not reach the server. Check that it is running and try again.");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response. Please try again.");
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || "The request could not be completed.");
  }

  return data;
}

function formatTime(date) {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Kigali",
  });
}

function formatDate(date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Kigali",
  });
}

function formatSchedule(start, end) {
  const startDay = start.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Africa/Kigali",
  });
  const endDay = end.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Africa/Kigali",
  });
  const dayLabel = startDay === endDay ? startDay : `${startDay}–${endDay}`;

  return `${dayLabel} · ${formatTime(start)}–${formatTime(end)} CAT`;
}

function mapExam(exam) {
  const startTime = new Date(exam.startTime);
  const closesAt = exam.closesAt
    ? new Date(exam.closesAt)
    : new Date(startTime.getTime() + (Number(exam.durationMinutes) || 0) * 60_000);
  const attempt = exam.attempt
    ? {
        ...exam.attempt,
        id: String(exam.attempt.id || exam.attempt._id),
      }
    : null;

  const now = new Date();
  const isPast = now >= closesAt;
  const isStarted = now >= startTime;
  const isSubmitted = Boolean(
    attempt && (attempt.status === "submitted" || attempt.status === "auto_submitted")
  );
  const isInProgress = Boolean(attempt && attempt.status === "in_progress");

  const status = isSubmitted || isPast || exam.status === "closed"
    ? "closed"
    : isStarted || exam.status === "open"
      ? "open"
      : "upcoming";
  const statusLabel = isSubmitted
    ? "Finished"
    : status === "closed"
      ? "Closed"
      : status === "open"
        ? isInProgress
          ? "In progress"
          : "Open now"
        : "Scheduled";

  return {
    ...exam,
    type: "exam",
    id: String(exam.id || exam._id),
    classId: String(exam.classId),
    startTime,
    closesAt,
    schedule: formatSchedule(startTime, closesAt),
    date: formatDate(startTime),
    dateLabel: formatDate(startTime),
    closesLabel: `${formatDate(closesAt)} · ${formatTime(closesAt)} CAT`,
    closesDate: formatDate(closesAt),
    closesTime: formatTime(closesAt),
    windowLabel: `${formatDate(startTime)} · ${formatTime(startTime)}–${formatTime(closesAt)} CAT`,
    details: `${exam.questionCount ?? 0} questions · ${exam.durationMinutes ?? 0} minutes · ${exam.totalPoints ?? 0} points`,
    summary: exam.instructions || "Complete the questions during the scheduled assessment window.",
    questionTypes: exam.questionTypes || "Questions",
    status,
    statusLabel,
    score: attempt?.resultReleased
      ? attempt.score
      : isPast && attempt?.score !== undefined
        ? attempt.score
        : undefined,
    availability:
      status === "upcoming"
        ? `Opens ${formatDate(startTime)} at ${formatTime(startTime)} CAT`
        : status === "closed"
          ? isSubmitted
            ? "Finished"
            : "Assessment closed"
          : "Open now",
  };
}

export async function getStudentClasses() {
  const { classes } = await studentRequest("/class/student");
  return classes.map((item) => ({
    id: String(item.id),
    name: item.name,
    description: item.description,
    code: item.classCode,
    teacher: item.teacher?.name || "Teacher",
    teacherEmail: item.teacher?.email || "",
    joinedOn: formatDate(new Date(item.joinedAt)),
  }));
}

export async function findClassByCode(classCode) {
  const { class: classItem } = await studentRequest("/class/lookup", {
    method: "POST",
    body: { classCode },
  });
  return {
    id: String(classItem.id),
    name: classItem.name,
    description: classItem.description,
    code: classItem.classCode,
    teacher: classItem.teacher?.name || "Teacher",
    teacherEmail: classItem.teacher?.email || "",
    alreadyJoined: classItem.alreadyJoined,
  };
}

export async function joinClass(classCode) {
  return studentRequest("/class/join", {
    method: "POST",
    body: { classCode },
  });
}

export async function getStudentExams() {
  const { exams } = await studentRequest("/exams/student");
  return exams.map(mapExam);
}

export async function getStudentAttempt(examId) {
  const { attempt } = await studentRequest(`/student-exams/attempts/exam/${examId}`);
  return attempt;
}

export async function startStudentExam(examId) {
  return studentRequest(`/student-exams/${examId}/start`, { method: "POST" });
}

export async function saveStudentAnswer(attemptId, questionId, selectedOptionIndex) {
  return studentRequest(`/student-exams/attempts/${attemptId}/answer`, {
    method: "PATCH",
    body: { questionId, selectedOptionIndex },
  });
}

export async function submitStudentExam(attemptId) {
  return studentRequest(`/student-exams/attempts/${attemptId}/submit`, {
    method: "POST",
  });
}

export async function getStudentAttemptResult(attemptId) {
  const data = await studentRequest(`/student-exams/attempts/${attemptId}/result`);
  return data.result;
}

export async function updateStudentProfile(fullName) {
  const { user } = await studentRequest("/auth/student/profile", {
    method: "PATCH",
    body: { fullName },
  });
  return user;
}

export async function changeStudentPassword(currentPassword, newPassword) {
  return studentRequest("/auth/student/password", {
    method: "PATCH",
    body: { currentPassword, newPassword },
  });
}
