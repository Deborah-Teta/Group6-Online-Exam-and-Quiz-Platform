import express from "express";
import {authenticate} from "../middleware/authMiddleware.js";
import {authorize} from "../middleware/roleMiddleware.js";
import {approveTeacher, getPendingTeachers} from "../controller/adminController.js";

const router = express.Router();

router.get(
    "/teachers/pending",
    authenticate,
    authorize("admin"),
    getPendingTeachers
);


router.patch(
    "/teachers/:teacherId/approve",
    authenticate,
    authorize("admin"),
    approveTeacher
);

export default router;