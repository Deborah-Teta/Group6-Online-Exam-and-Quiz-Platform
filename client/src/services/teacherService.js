async function teacherRequest(path, { method = "GET", body } = {}) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  let response;
  try {
    response = await fetch(`/api${path}`, {
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

function mapQuestion(question) {
  return {
    ...question,
    id: String(question.id || question._id),
    options: (question.options || []).map((option) => ({ ...option })),
  };
}

function mapClass(item) {
  const nextExam = item.nextExam;
  return {
    ...item,
    id: String(item.id || item._id),
    code: item.code || item.classCode,
    students: item.students || 0,
    active: item.active ?? item.isActive,
    nextItem: nextExam?.title || "No upcoming assessments",
    nextSchedule: nextExam
      ? new Date(nextExam.startTime).toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Africa/Kigali",
        }) + " CAT"
      : "No assessments scheduled",
  };
}

function mapExam(item) {
  return {
    ...item,
    id: String(item.id || item._id),
    classId: String(item.classId?.id || item.classId?._id || item.classId),
  };
}

export async function getTeacherDashboard() {
  return teacherRequest("/teacher/dashboard");
}

export async function getTeacherClasses() {
  const { classes } = await teacherRequest("/class/teacher");
  return classes.map(mapClass);
}

export async function getTeacherClassDetails(classId) {
  const { class: classItem } = await teacherRequest(`/class/teacher/${classId}`);
  return {
    ...mapClass(classItem),
    students: (classItem.students || []).map((student) => ({
      ...student,
      id: String(student.id || student._id),
      name: student.name || student.fullName || "Student",
    })),
    exams: (classItem.exams || []).map(mapExam),
  };
}

export async function createTeacherClass(values) {
  const { class: classItem } = await teacherRequest("/class", {
    method: "POST",
    body: values,
  });
  return mapClass(classItem);
}

export async function getTeacherQuestions() {
  const data = await teacherRequest("/questions/my-bank");
  return {
    questions: data.questions.map(mapQuestion),
    pendingDraftCount: data.pendingDraftCount,
  };
}

export async function createTeacherQuestion(question) {
  const { question: created } = await teacherRequest("/questions", {
    method: "POST",
    body: question,
  });
  return mapQuestion(created);
}

export async function updateTeacherQuestion(questionId, question) {
  const { question: updated } = await teacherRequest(`/questions/${questionId}`, {
    method: "PATCH",
    body: question,
  });
  return mapQuestion(updated);
}

export function deleteTeacherQuestion(questionId) {
  return teacherRequest(`/questions/${questionId}`, { method: "DELETE" });
}

export async function getTeacherExams() {
  const { exams } = await teacherRequest("/exams/teacher");
  return exams.map(mapExam);
}

export async function createTeacherExam(exam) {
  const { exam: created } = await teacherRequest("/exams", {
    method: "POST",
    body: exam,
  });
  return mapExam(created);
}

export function getTeacherExamResults(examId) {
  return teacherRequest(`/teacher-results/${examId}/results`);
}
