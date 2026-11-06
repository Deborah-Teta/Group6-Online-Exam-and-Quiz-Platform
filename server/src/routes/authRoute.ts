import express from "express"
import {
    changeStudentPassword,
    loginUser,
    registerUser,
    updateStudentProfile
} from "../controller/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router()

router.post("/register",registerUser)
router.post("/login",loginUser)
router.patch("/student/profile", authenticate, updateStudentProfile)
router.patch("/student/password", authenticate, changeStudentPassword)

export default router