import express from "express";
import {authenticate} from "../middleware/authMiddleware.js";
import {authorize} from "../middleware/roleMiddleware.js";
import {createClass} from "../controller/classController.js";


const router = express.Router();

router.post(
    "/",
    authenticate,
    authorize("teacher"),
    createClass
);

export default router;