import express from "express";
import mongoose from "mongoose";

import { examModel } from "../models/ExamSchema.js";
import { classModel } from "../models/ClassSchema.js";
import {questionModel} from "../models/QuestionsSchema.js";
import { classMemberModel } from "../models/ClassMember.js";
import { examAttemptModel } from "../models/ExamAttemptSchema.js";



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

export const getStudentExams = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const studentId = (req as any).user.userId;
        const memberships = await classMemberModel.find({ studentId });
        const classIds = memberships.map(m => m.classId);

        const exams = await examModel
            .find({
                classId: { $in: classIds },
                status: { $in: ["scheduled", "published", "closed"] }
            })
            .populate("classId", "name")
            .populate("teacherId", "fullName email")
            .populate("questionIds", "points type")
            .sort({ startTime: -1 });

        const examIds = exams.map(e => e._id);
        const attempts = await examAttemptModel.find({
            studentId,
            examId: { $in: examIds }
        });

        const now = new Date();

        const result = exams.map(exam => {
            const cls = exam.classId as any;
            const teacher = exam.teacherId as any;
            const questions = (exam.questionIds as any[]) || [];
            const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
            const questionTypes = [
                ...new Set(
                    questions.map(q =>
                        q.type === "true_false" ? "True/False" : "Multiple choice"
                    )
                )
            ].join(", ") || "Questions";

            const attempt = attempts.find(
                a => a.examId.toString() === exam._id.toString()
            );
            const deadline = new Date(
                exam.startTime.getTime() + exam.durationMinutes * 60 * 1000
            );
            const isClosed = exam.status === "closed" || now >= deadline;

            let status: "upcoming" | "open" | "closed" = "upcoming";
            let statusLabel = "Scheduled";

            if (attempt && attempt.status !== "in_progress") {
                status = "closed";
                statusLabel = "Submitted";
            } else if (now < exam.startTime) {
                status = "upcoming";
                statusLabel = "Scheduled";
            } else if (now >= exam.startTime && now < deadline) {
                status = "open";
                statusLabel =
                    attempt?.status === "in_progress" ? "In progress" : "Open now";
            } else {
                status = "closed";
                statusLabel = "Closed";
            }

            return {
                id: exam._id,
                classId: cls?._id || exam.classId,
                className: cls?.name || "Class",
                teacher: teacher?.fullName || "Teacher",
                title: exam.title,
                type: exam.durationMinutes <= 20 ? "quiz" : "exam",
                instructions: exam.instructions,
                startTime: exam.startTime,
                closesAt: deadline,
                durationMinutes: exam.durationMinutes,
                questionCount: questions.length,
                totalPoints,
                questionTypes,
                status,
                statusLabel,
                attempt: attempt
                    ? {
                        id: attempt._id,
                        status: attempt.status,
                        score: isClosed && exam.showAnswersAfterClose ? attempt.score : undefined,
                        percentage: isClosed && exam.showAnswersAfterClose ? attempt.percentage : undefined,
                        resultReleased: isClosed && exam.showAnswersAfterClose,
                        submittedAt: attempt.submittedAt
                    }
                    : null
            };
        });

        return res.status(200).json({ exams: result });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to retrieve student exams" });
    }
};

export const getTeacherExams = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const teacherId = (req as any).user.userId;
        const exams = await examModel
            .find({ teacherId })
            .populate("classId", "name")
            .populate("questionIds", "points")
            .sort({ createdAt: -1 });

        const result = exams.map(exam => {
            const cls = exam.classId as any;
            const questions = (exam.questionIds as any[]) || [];
            const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
            return {
                id: exam._id,
                title: exam.title,
                classId: cls?._id || exam.classId,
                className: cls?.name || "Class",
                startTime: exam.startTime,
                durationMinutes: exam.durationMinutes,
                status: exam.status,
                questionCount: questions.length,
                totalPoints
            };
        });

        return res.status(200).json({ exams: result });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to retrieve teacher exams" });
    }
};