import express from "express";
import mongoose from "mongoose";

import { examModel } from "../models/ExamSchema.js";
import { classModel } from "../models/ClassSchema.js";
import {questionModel} from "../models/QuestionsSchema.js";
import { classMemberModel } from "../models/ClassMember.js";
import { examAttemptModel } from "../models/ExamAttemptSchema.js";
import { finalizeAttempt } from "./studentExamController.js";

export const getTeacherExams = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const teacherId = (req as any).user.userId;
        const exams: any[] = await examModel
            .find({ teacherId })
            .populate("classId", "name")
            .populate("questionIds", "points type")
            .sort({ startTime: -1 })
            .lean();

        return res.status(200).json({
            exams: exams.map((exam) => ({
                id: exam._id,
                title: exam.title,
                type: exam.type || "exam",
                classId: exam.classId?._id,
                className: exam.classId?.name || "Class",
                startTime: exam.startTime,
                durationMinutes: exam.durationMinutes,
                status: exam.status,
                questionCount: exam.questionIds.length,
                totalPoints: exam.questionIds.reduce(
                    (total: number, question: { points?: number }) =>
                        total + (question?.points || 0),
                    0
                )
            }))
        });
    } catch (error) {
        console.error("Failed to retrieve teacher assessments:", error);
        return res.status(500).json({ error: "Failed to retrieve assessments." });
    }
};

export const getStudentExams = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const studentId = (req as any).user.userId;
        const memberships = await classMemberModel.find({ studentId });
        const joinedClasses = await classModel.find({
            _id: { $in: memberships.map((membership) => membership.classId) },
            isActive: true
        }).select("_id");
        const classIds = joinedClasses.map((classItem) => classItem._id);

        const exams: any[] = await examModel
            .find({
                classId: { $in: classIds },
                status: { $in: ["scheduled", "published", "closed"] }
            })
            .populate({
                path: "classId",
                select: "name",
                populate: { path: "teacherId", select: "fullName" }
            })
            .populate({ path: "questionIds", select: "points type" })
            .sort({ startTime: 1 });

        const examIds = exams.map((exam) => exam._id);
        const attempts = await examAttemptModel.find({
            studentId,
            examId: { $in: examIds }
        });
        const now = new Date();
        const examsById = new Map(
            exams.map((exam) => [exam._id.toString(), exam])
        );
        await Promise.all(
            attempts.map(async (attempt) => {
                const exam = examsById.get(attempt.examId.toString());
                if (!exam || attempt.status !== "in_progress") return;
                const deadline = new Date(
                    exam.startTime.getTime() + exam.durationMinutes * 60 * 1000
                );
                if (now >= deadline) {
                    await finalizeAttempt(attempt, exam, true);
                }
            })
        );
        const attemptsByExamId = new Map(
            attempts.map((attempt) => [attempt.examId.toString(), attempt])
        );

        return res.status(200).json({
            exams: exams.map((exam) => {
                const startTime = new Date(exam.startTime);
                const closesAt = new Date(
                    startTime.getTime() + exam.durationMinutes * 60 * 1000
                );
                const ended = exam.status === "closed" || now >= closesAt;
                const status = ended ? "closed" : now < startTime ? "upcoming" : "open";
                const attempt = attemptsByExamId.get(exam._id.toString());
                const resultReleased = Boolean(
                    ended &&
                    attempt &&
                    attempt.status !== "in_progress"
                );
                const questionTypes = [
                    ...new Set(
                        exam.questionIds.map((question: any) =>
                            question.type === "true_false"
                                ? "True / false"
                                : "Multiple choice"
                        )
                    )
                ];

                return {
                    id: exam._id,
                    title: exam.title,
                    type: exam.type || "exam",
                    instructions: exam.instructions || "",
                    classId: exam.classId?._id,
                    className: exam.classId?.name || "Class",
                    teacher: exam.classId?.teacherId?.fullName || "Teacher",
                    startTime,
                    closesAt,
                    durationMinutes: exam.durationMinutes,
                    questionCount: exam.questionIds.length,
                    totalPoints: exam.questionIds.reduce(
                        (total: number, question: any) => total + (question.points || 0),
                        0
                    ),
                    questionTypes: questionTypes.join(" + "),
                    status,
                    statusLabel: status === "open"
                        ? "Open now"
                        : status === "upcoming"
                            ? "Upcoming"
                            : attempt && attempt.status !== "in_progress"
                                ? "Completed"
                                : "Closed",
                    availability: status === "upcoming" ? "Not yet open" : "",
                    attempt: attempt
                        ? {
                            id: attempt._id,
                            status: attempt.status,
                            submittedAt: attempt.submittedAt,
                            resultReleased,
                            score: resultReleased ? attempt.percentage : null,
                            points: resultReleased ? attempt.score : null,
                            totalPoints: attempt.totalPoints
                        }
                        : null
                };
            })
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to retrieve your assessments." });
    }
};

export const createExam = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const {
            title,
            type,
            instructions,
            classId,
            questionIds,
            startTime,
            durationMinutes,
            status
        } = req.body;

        if (type !== undefined && !["exam", "quiz"].includes(type)) {
            return res.status(400).json({ error: "Assessment type must be exam or quiz." });
        }
        if (status !== undefined && !["draft", "scheduled"].includes(status)) {
            return res.status(400).json({ error: "Assessment status must be draft or scheduled." });
        }

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

        const examStatus = status || "scheduled";
        if (examStatus === "scheduled" && examStartTime <= new Date()) {
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
            type: type || "exam",
            instructions,
            questionIds: uniqueQuestionIds,
            startTime: examStartTime,
            durationMinutes,
            status: examStatus,
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