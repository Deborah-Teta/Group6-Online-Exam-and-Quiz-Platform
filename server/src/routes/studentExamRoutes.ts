import express from "express";
import {authenticate} from "../middleware/authMiddleware.js";
import {authorize} from "../middleware/roleMiddleware.js";
import {
    getAttemptByExam,
    getAttemptResult,
    saveAnswer,
    startExam,
    submitExam
} from "../controller/studentExamController.js";

const router = express.Router();

router.post(
    "/:examId/start",
    authenticate,
    authorize("student"),
    startExam
);

router.patch(
    "/attempts/:attemptId/answer",
    authenticate,
    authorize("student"),
    saveAnswer
);

router.post(
    "/attempts/:attemptId/submit",
    authenticate,
    authorize("student"),
    submitExam
);

router.get(
    "/attempts/:attemptId/result",
    authenticate,
    authorize("student"),
    getAttemptResult
);

router.get(
    "/attempts/exam/:examId",
    authenticate,
    authorize("student"),
    getAttemptByExam
);

export default router;