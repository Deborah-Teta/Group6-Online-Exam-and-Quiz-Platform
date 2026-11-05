import express from "express";
import {authenticate} from "../middleware/authMiddleware.js";
import {authorize} from "../middleware/roleMiddleware.js";
import {
    createClass,
    findClassByCode,
    getStudentClasses,
    getTeacherClasses,
    getTeacherClassDetails,
    joinClass
} from "../controller/classController.js";



const router = express.Router();

router.get(
    "/student",
    authenticate,
    authorize("student"),
    getStudentClasses
);

router.get(
    "/teacher",
    authenticate,
    authorize("teacher"),
    getTeacherClasses
);

router.get(
    "/teacher/:classId",
    authenticate,
    authorize("teacher"),
    getTeacherClassDetails
);

router.post(
    "/lookup",
    authenticate,
    authorize("student"),
    findClassByCode
);


router.post(
    "/",
    authenticate,
    authorize("teacher"),
    createClass
);


router.post(
    "/join",
    authenticate,
    authorize("student"),
    joinClass
);

export default router;