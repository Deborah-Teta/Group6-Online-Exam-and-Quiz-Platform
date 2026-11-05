import express from "express";
import { getTeacherDashboard } from "../controller/teacherDashboardController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/dashboard", authenticate, authorize("teacher"), getTeacherDashboard);

export default router;
