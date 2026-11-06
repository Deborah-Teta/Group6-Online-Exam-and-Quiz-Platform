import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { getTeacherDashboard } from "../controller/teacherDashboardController.js";

const router = express.Router();

router.get(
    "/dashboard",
    authenticate,
    authorize("teacher"),
    getTeacherDashboard
);

export default router;

