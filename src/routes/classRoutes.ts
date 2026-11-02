import express from "express";
import {authenticate} from "../middleware/authMiddleware.js";


const router = express.Router();

router.post(
    "/",
    authenticate,
    authorize("teacher"),
    createClass
);

export default router;