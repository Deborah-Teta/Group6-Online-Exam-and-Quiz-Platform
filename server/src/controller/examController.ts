import express from "express";
import mongoose from "mongoose";

import { examModel } from "../models/ExamSchema.js";
import { classModel } from "../models/ClassSchema.js";
import {questionModel} from "../models/QuestionsSchema.js";



export const createExam = async (
    req: express.Request,
    res: express.Response
) => {

    try {
        const {
            title,
            instructions,
            classId,
            questionIds,
            startTime,
            durationMinutes
        } = req.body;

        if (
            !title?.trim() ||
            !classId ||
            !Array.isArray(questionIds) ||
            !questionIds.length ||
            !startTime ||
            durationMinutes === undefined
        ) {
            return res.status(400).json({
                error: "Please provide all required exam details."
            });
        }


        if (!mongoose.Types.ObjectId.isValid(classId)) {
            return res.status(400).json({
                error: "Invalid class ID."
            });
        }

        if (
            !questionIds.every((id: string) =>
                mongoose.Types.ObjectId.isValid(id)
            )
        ) {
            return res.status(400).json({
                error: "One or more question IDs are invalid."
            });
        }


        const uniqueQuestionIds = [
            ...new Set(questionIds.map((id: string) => id.toString()))
        ];

        if (uniqueQuestionIds.length !== questionIds.length) {
            return res.status(400).json({
                error: "Duplicate questions are not allowed."
            });
        }


        if (
            !Number.isInteger(durationMinutes) ||
            durationMinutes < 1 ||
            durationMinutes > 600
        ) {
            return res.status(400).json({
                error: "Duration must be between 1 and 600 minutes."
            });
        }

        const examStartTime = new Date(startTime);

        if (Number.isNaN(examStartTime.getTime())) {
            return res.status(400).json({
                error: "Invalid exam start time."
            });
        }

        if (examStartTime <= new Date()) {
            return res.status(400).json({
                error: "Exam start time must be in the future."
            });
        }

        const teacherId = (req as any).user.userId;


        const existingClass = await classModel.findOne({
            _id: classId,
            teacherId,
            isActive: true
        });

        if (!existingClass) {
            return res.status(404).json({
                error: "Class not found or does not belong to you."
            });
        }


        const questions = await questionModel.find({
            _id: { $in: uniqueQuestionIds },
            teacherId
        });

        if (questions.length !== uniqueQuestionIds.length) {
            return res.status(400).json({
                error: "Some questions do not exist or do not belong to you."
            });
        }


        const exam = await examModel.create({
            teacherId,
            classId,
            title: title.trim(),
            instructions,
            questionIds: uniqueQuestionIds,
            startTime: examStartTime,
            durationMinutes,
            status: "scheduled",
            showAnswersAfterClose: true
        });

        return res.status(201).json({
            message: "Exam created successfully.",
            exam
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            error: "Failed to create exam."
        });
    }
};