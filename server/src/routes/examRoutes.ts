import express from "express";
import {authenticate} from "../middleware/authMiddleware.js";
import {authorize} from "../middleware/roleMiddleware.js";
import {
    createExam,
    getStudentExams,
    getTeacherExams
} from "../controller/examController.js";


const router = express.Router();

router.get(
    "/student",
    authenticate,
    authorize("student"),
    getStudentExams
);

router.get(
    "/teacher",
    authenticate,
    authorize("teacher"),
    getTeacherExams
);

router.post(
    "/",
    authenticate,
    authorize("teacher"),
    createExam
);

export default router;