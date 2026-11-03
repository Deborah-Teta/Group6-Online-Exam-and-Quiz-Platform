import express from "express";
import {authenticate} from "../middleware/authMiddleware.js";
import {authorize} from "../middleware/roleMiddleware.js";
import {createQuestion} from "../controller/questionController.js";


const router = express.Router();


router.post(
    "/",
    authenticate,
    authorize("teacher"),
    createQuestion
);
//
// router.get(
//     "/my-bank",
//     authenticate,
//     authorize("teacher"),
//     getMyQuestions
// );

export default router;