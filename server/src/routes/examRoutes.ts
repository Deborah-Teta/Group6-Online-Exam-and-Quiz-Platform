import express from "express";
import {authenticate} from "../middleware/authMiddleware.js";
import {authorize} from "../middleware/roleMiddleware.js";
import {createExam} from "../controller/examController.js";


const router = express.Router();

router.post(
    "/",
    authenticate,
    authorize("teacher"),
    createExam
);

export default router;