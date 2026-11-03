import express from "express";
import {authenticate} from "../middleware/authMiddleware.js";
import {authorize} from "../middleware/roleMiddleware.js";
import {
    blockUser,
    getAllClasses,
    getAllUsers,
    getPlatformStats,
    unblockUser
} from "../controller/adminDashboardController.js";


const router = express.Router();

router.use(authenticate, authorize("admin"));

router.get("/users", getAllUsers);
router.patch("/users/:userId/block", blockUser);
router.patch("/users/:userId/unblock", unblockUser);

router.get("/classes", getAllClasses);

router.get("/stats", getPlatformStats);

export default router;