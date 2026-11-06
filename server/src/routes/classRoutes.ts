import express from "express";
import {authenticate} from "../middleware/authMiddleware.js";
import {authorize} from "../middleware/roleMiddleware.js";
import {
    createClass,
    joinClass,
    getStudentClasses,
    lookupClass,
    getTeacherClasses,
    getTeacherClassDetails
} from "../controller/classController.js";

const router = express.Router();

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

router.get(
    "/student",
    authenticate,
    authorize("student"),
    getStudentClasses
);

router.post(
    "/lookup",
    authenticate,
    authorize("student"),
    lookupClass
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

export default router;