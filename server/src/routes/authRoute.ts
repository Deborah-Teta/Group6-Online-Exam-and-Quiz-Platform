import express from "express"
import {
    changeStudentPassword,
    loginUser,
    registerUser,
    updateStudentProfile
} from "../controller/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";


const router = express.Router()

router.post("/register",registerUser)
router.post("/login",loginUser)
router.patch(
    "/student/profile",
    authenticate,
    authorize("student"),
    updateStudentProfile
);
router.patch(
    "/student/password",
    authenticate,
    authorize("student"),
    changeStudentPassword
);

export default router