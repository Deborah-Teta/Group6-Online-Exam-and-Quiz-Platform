import express from "express";
import {authenticate} from "../middleware/authMiddleware.js";
import {authorize} from "../middleware/roleMiddleware.js";
import {createClass, joinClass} from "../controller/classController.js";



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

export default router;