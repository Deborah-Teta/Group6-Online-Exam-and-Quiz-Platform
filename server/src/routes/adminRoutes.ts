import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
    getPlatformStats,
    getPendingTeachers,
    approveTeacher,
    rejectTeacher,
    getAllUsers,
    blockUser,
    unblockUser,
    getAllClasses,
    getAuditLogs
} from "../controller/adminController.js";

const router = express.Router();

// All routes require authentication & admin role
router.use(authenticate, authorize("admin"));

// Platform Stats
router.get("/stats", getPlatformStats);

// Teacher Approval
router.get("/teachers/pending", getPendingTeachers);
router.patch("/teachers/:teacherId/approve", approveTeacher);
router.patch("/teachers/:teacherId/reject", rejectTeacher);

// Users Management
router.get("/users", getAllUsers);
router.patch("/users/:userId/block", blockUser);
router.patch("/users/:userId/unblock", unblockUser);

// Classes & Audit
router.get("/classes", getAllClasses);
router.get("/audit-logs", getAuditLogs);

export default router;
