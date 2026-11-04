import express from "express";
import {authenticate} from "../middleware/authMiddleware.js";
import {authorize} from "../middleware/roleMiddleware.js";
import {getExamResults} from "../controller/teacherResultController.js";


const router = express.Router();

router.get(
    "/:examId/results",
    authenticate,
    authorize("teacher"),
    getExamResults
);

export default router;