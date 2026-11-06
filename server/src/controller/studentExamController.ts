import express from "express";
import mongoose from "mongoose";
import {examModel} from "../models/ExamSchema.js";
import {classMemberModel} from "../models/ClassMember.js";
import {examAttemptModel} from "../models/ExamAttemptSchema.js";
import {questionModel} from "../models/QuestionsSchema.js";


export const startExam = async (
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
        const studentId = (req as any).user.userId;

        if (!mongoose.Types.ObjectId.isValid(examId)) {
            return res.status(400).json({ error: "Invalid exam ID." });
        }

        const exam = await examModel.findById(examId);

        if (!exam || !["scheduled", "published"].includes(exam.status)) {
            return res.status(404).json({ error: "Exam not found." });
        }

        const membership = await classMemberModel.findOne({
            classId: exam.classId,
            studentId
        });

        if (!membership) {
            return res.status(403).json({
                error: "You are not a member of this class."
            });
        }

        const now = new Date();

        const deadline = new Date(
            exam.startTime.getTime() +
            exam.durationMinutes * 60 * 1000
        );

        if (now < exam.startTime) {
            return res.status(403).json({
                error: "This exam has not started yet.",
                startTime: exam.startTime
            });
        }

        if (now >= deadline) {
            return res.status(403).json({
                error: "The exam time has expired."
            });
        }


        const existingAttempt = await examAttemptModel.findOne({
            examId,
            studentId
        });

        if (existingAttempt) {
            return res.status(409).json({
                error: "You have already started or submitted this exam."
            });
        }

        const questions = await questionModel.find({
            _id: { $in: exam.questionIds }
        });

        if (questions.length !== exam.questionIds.length) {
            return res.status(500).json({
                error: "Some exam questions are unavailable."
            });
        }

        const totalPoints = questions.reduce(
            (total, question) => total + question.points,
            0
        );

        const attempt = await examAttemptModel.create({
            examId,
            studentId,
            startedAt: now,
            status: "in_progress",
            totalPoints,
            answers: questions.map(question => ({
                questionId: question._id,
                selectedOptionIndex: null
            }))
        });

        const safeQuestions = questions.map(question => ({
            _id: question._id,
            topic: question.topic,
            type: question.type,
            questionText: question.questionText,
            options: question.options.map(option => ({
                text: option.text
            })),
            points: question.points
        }));

        return res.status(201).json({
            message: "Exam started successfully.",
            attemptId: attempt._id,
            title: exam.title,
            startedAt: attempt.startedAt,
            deadline,
            questions: safeQuestions
        });

    } catch (error: any) {

        if (error.code === 11000) {
            return res.status(409).json({
                error: "You have already attempted this exam."
            });
        }

        console.log(error);

        return res.status(500).json({
            error: "Failed to start exam."
        });
    }
};


export const saveAnswer = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { attemptId } = req.params;

        if (typeof attemptId !== "string") {
            return res.status(400).json({
                message: "Invalid attempt ID"
            });
        }
        const { questionId, selectedOptionIndex } = req.body;
        const studentId = (req as any).user.userId;

        if (
            !mongoose.Types.ObjectId.isValid(attemptId) ||
            !mongoose.Types.ObjectId.isValid(questionId)
        ) {
            return res.status(400).json({ error: "Invalid ID." });
        }

        if (
            selectedOptionIndex !== null &&
            (!Number.isInteger(selectedOptionIndex) || selectedOptionIndex < 0)
        ) {
            return res.status(400).json({
                error: "Invalid selected option."
            });
        }

        const attempt = await examAttemptModel.findOne({
            _id: attemptId,
            studentId,
            status: "in_progress"
        });

        if (!attempt) {
            return res.status(404).json({
                error: "Active exam attempt not found."
            });
        }

        const exam = await examModel.findById(attempt.examId);

        if (!exam) {
            return res.status(404).json({ error: "Exam not found." });
        }

        const deadline = new Date(
            exam.startTime.getTime() +
            exam.durationMinutes * 60 * 1000
        );

        if (new Date() >= deadline) {
            return res.status(403).json({
                error: "Time has expired. Submit your exam."
            });
        }

        const question = await questionModel.findOne({
            _id: questionId,
            teacherId: exam.teacherId
        });

        if (
            !question ||
            !exam.questionIds.some(
                id => id.toString() === questionId
            )
        ) {
            return res.status(404).json({
                error: "Question does not belong to this exam."
            });
        }

        if (
            selectedOptionIndex !== null &&
            selectedOptionIndex >= question.options.length
        ) {
            return res.status(400).json({
                error: "Selected option does not exist."
            });
        }

        const answer = attempt.answers.find(
            item => item.questionId.toString() === questionId
        );

        if (!answer) {
            return res.status(404).json({
                error: "Answer not found."
            });
        }

        answer.selectedOptionIndex = selectedOptionIndex;

        await attempt.save();

        return res.status(200).json({
            message: "Answer saved successfully."
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Failed to save answer."
        });
    }
};


const finalizeAttempt = async (
    attempt: any,
    exam: any,
    automatic: boolean
) => {
    const questions = await questionModel.find({
        _id: { $in: exam.questionIds }
    });

    let score = 0;

    for (const answer of attempt.answers) {
        const question = questions.find(
            q => q._id.toString() === answer.questionId.toString()
        );

        if (!question) continue;

        const selectedIndex = answer.selectedOptionIndex;

        const selectedOption =
            selectedIndex === null
                ? null
                : question.options[selectedIndex];

        const isCorrect = selectedOption?.isCorrect === true;

        answer.isCorrect = isCorrect;
        answer.awardedPoints = isCorrect ? question.points : 0;

        score += answer.awardedPoints;
    }

    attempt.score = score;
    attempt.percentage = attempt.totalPoints > 0
        ? Number(((score / attempt.totalPoints) * 100).toFixed(2))
        : 0;

    attempt.status = automatic ? "auto_submitted" : "submitted";
    attempt.submittedAt = new Date();

    await attempt.save();

    return attempt;
};

export const submitExam = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { attemptId } = req.params;
        const studentId = (req as any).user.userId;

        const attempt = await examAttemptModel.findOne({
            _id: attemptId,
            studentId,
            status: "in_progress"
        });

        if (!attempt) {
            return res.status(404).json({
                error: "Active attempt not found."
            });
        }

        const exam = await examModel.findById(attempt.examId);

        if (!exam) {
            return res.status(404).json({ error: "Exam not found." });
        }

        const deadline = new Date(
            exam.startTime.getTime() +
            exam.durationMinutes * 60 * 1000
        );

        const automatic = new Date() >= deadline;

        const result = await finalizeAttempt(
            attempt,
            exam,
            automatic
        );

        return res.status(200).json({
            message: automatic
                ? "Time expired. Your exam was automatically submitted."
                : "Exam submitted successfully.",
            result: {
                score: result.score,
                totalPoints: result.totalPoints,
                percentage: result.percentage,
                status: result.status
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Failed to submit exam."
        });
    }
};

export const getAttemptResult = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { attemptId } = req.params;
        if (typeof attemptId !== "string") {
            return res.status(400).json({
                message: "Invalid attempt ID"
            });
        }
        const studentId = (req as any).user.userId;

        if (!mongoose.Types.ObjectId.isValid(attemptId)) {
            return res.status(400).json({
                error: "Invalid attempt ID."
            });
        }

        const attempt = await examAttemptModel.findOne({
            _id: attemptId,
            studentId
        });

        if (!attempt) {
            return res.status(404).json({
                error: "Exam attempt not found."
            });
        }

        const exam = await examModel.findById(attempt.examId);

        if (!exam) {
            return res.status(404).json({
                error: "Exam not found."
            });
        }

        const now = new Date();

        const deadline = new Date(
            exam.startTime.getTime() +
            exam.durationMinutes * 60 * 1000
        );

        const examClosed = exam.status === "closed" || now >= deadline;

        if (
            attempt.status === "in_progress" &&
            examClosed
        ) {
            await finalizeAttempt(attempt, exam, true);
        }

        if (attempt.status === "in_progress") {
            return res.status(403).json({
                error: "You must submit your exam before viewing results."
            });
        }


        const result: any = {
            examTitle: exam.title,
            score: attempt.score,
            totalPoints: attempt.totalPoints,
            percentage: attempt.percentage,
            status: attempt.status,
            submittedAt: attempt.submittedAt,
            answersReleased: false
        };

        if (examClosed && exam.showAnswersAfterClose) {
            const questions = await questionModel.find({
                _id: { $in: exam.questionIds }
            });

            result.answersReleased = true;

            result.answers = attempt.answers.map(answer => {
                const question = questions.find(
                    q => q._id.toString() === answer.questionId.toString()
                );

                if (!question) return null;

                const correctOptionIndex = question.options.findIndex(
                    option => option.isCorrect
                );

                return {
                    questionId: question._id,
                    questionText: question.questionText,
                    options: question.options.map(option => option.text),
                    selectedOptionIndex: answer.selectedOptionIndex,
                    correctOptionIndex,
                    correctAnswer: question.options[correctOptionIndex]?.text,
                    isCorrect: answer.isCorrect,
                    awardedPoints: answer.awardedPoints,
                    explanation: question.explanation
                };
            });
        } else {
            result.message = "Correct answers will be available when the exam closes.";
        }

        return res.status(200).json({
            message: "Exam result retrieved successfully.",
            result
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            error: "Failed to retrieve exam result."
        });
    }
};

export const getAttemptByExam = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { examId } = req.params;
        const studentId = (req as any).user.userId;

        if (typeof examId !== "string" || !mongoose.Types.ObjectId.isValid(examId)) {
            return res.status(400).json({ error: "Invalid exam ID." });
        }

        const attempt = await examAttemptModel.findOne({ examId, studentId });
        if (!attempt) {
            return res.status(404).json({ error: "No attempt found." });
        }

        const exam = await examModel.findById(examId);
        if (!exam) {
            return res.status(404).json({ error: "Exam not found." });
        }

        const now = new Date();
        const deadline = new Date(
            exam.startTime.getTime() + exam.durationMinutes * 60 * 1000
        );
        const examClosed = exam.status === "closed" || now >= deadline;

        if (attempt.status === "in_progress" && examClosed) {
            await finalizeAttempt(attempt, exam, true);
        }

        const questions = await questionModel.find({
            _id: { $in: exam.questionIds }
        });

        const safeQuestions = questions.map(q => {
            const savedAnswer = attempt.answers.find(
                a => a.questionId.toString() === q._id.toString()
            );
            return {
                id: q._id,
                topic: q.topic,
                type: q.type,
                text: q.questionText,
                options: q.options.map(opt => opt.text),
                points: q.points,
                selectedOptionIndex: savedAnswer?.selectedOptionIndex ?? null
            };
        });

        const answeredCount = attempt.answers.filter(
            a => a.selectedOptionIndex !== null && a.selectedOptionIndex !== undefined
        ).length;

        const resultReleased = examClosed && exam.showAnswersAfterClose;

        return res.status(200).json({
            attempt: {
                id: attempt._id,
                examId: attempt.examId,
                status: attempt.status,
                startedAt: attempt.startedAt,
                submittedAt: attempt.submittedAt,
                deadline,
                score: resultReleased ? attempt.score : undefined,
                totalPoints: attempt.totalPoints,
                percentage: resultReleased ? attempt.percentage : undefined,
                resultReleased,
                answeredCount,
                questions: safeQuestions
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to retrieve attempt" });
    }
};