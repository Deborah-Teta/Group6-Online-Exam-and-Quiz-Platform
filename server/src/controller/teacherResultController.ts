import express from "express";
import mongoose from "mongoose";
import {examModel} from "../models/ExamSchema.js";
import {examAttemptModel} from "../models/ExamAttemptSchema.js";
import {questionModel} from "../models/QuestionsSchema.js";



export const getExamResults = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { examId } = req.params;
        if (typeof examId !== "string") {
            return res.status(400).json({
                message: "Invalid exam ID"
            });
        }
        const teacherId = (req as any).user.userId;


        if (!mongoose.Types.ObjectId.isValid(examId)) {
            return res.status(400).json({
                error: "Invalid exam ID."
            });
        }

        const exam = await examModel.findOne({
            _id: examId,
            teacherId
        });

        if (!exam) {
            return res.status(404).json({
                error: "Exam not found."
            });
        }


        const attempts = await examAttemptModel.find({
            examId
        })
            .populate("studentId", "fullName email")
            .sort({ createdAt: 1 });


        const submittedAttempts = attempts.filter(
            attempt =>
                attempt.status === "submitted" ||
                attempt.status === "auto_submitted"
        );


        const totalPercentage = submittedAttempts.reduce(
            (total, attempt) => total + attempt.percentage,
            0
        );

        const classAverage = submittedAttempts.length > 0
            ? Number(
                (totalPercentage / submittedAttempts.length).toFixed(2)
            )
            : 0;


        const studentResults = attempts.map(attempt => {
            const student = attempt.studentId as any;

            const isSubmitted =
                attempt.status === "submitted" ||
                attempt.status === "auto_submitted";

            return {
                studentId: student?._id,
                fullName: student?.fullName ?? "Unknown student",
                email: student?.email,
                score: isSubmitted ? attempt.score : null,
                totalPoints: attempt.totalPoints,
                percentage: isSubmitted ? attempt.percentage : null,
                status: attempt.status,
                submittedAt: attempt.submittedAt ?? null
            };
        });

        const questions = await questionModel.find({
            _id: { $in: exam.questionIds }
        });


        const questionResults = questions.map(question => {
            let correctCount = 0;

            for (const attempt of submittedAttempts) {
                const answer = attempt.answers.find(
                    item =>
                        item.questionId.toString() === question._id.toString()
                );

                if (answer?.isCorrect === true) {
                    correctCount++;
                }
            }

            const totalStudents = submittedAttempts.length;

            const correctPercentage = totalStudents > 0
                ? Number(
                    ((correctCount / totalStudents) * 100).toFixed(2)
                )
                : 0;

            return {
                questionId: question._id,
                questionText: question.questionText,
                topic: question.topic,
                points: question.points,
                correctCount,
                totalStudents,
                correctPercentage
            };
        });

        return res.status(200).json({
            message: "Exam results retrieved successfully.",
            exam: {
                id: exam._id,
                title: exam.title,
                classId: exam.classId,
                startTime: exam.startTime,
                durationMinutes: exam.durationMinutes
            },
            summary: {
                totalAttempts: attempts.length,
                submittedAttempts: submittedAttempts.length,
                inProgressAttempts: attempts.length - submittedAttempts.length,
                classAverage
            },
            studentResults,
            questionResults
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            error: "Failed to retrieve exam results."
        });
    }
};