import express from "express"
import mongoose from "mongoose";
import {questionModel} from "../models/QuestionsSchema.js";
import { examModel } from "../models/ExamSchema.js";
import { aiDraftModel } from "../models/AiDraftSchema.js";

function validateQuestion(input: any) {
    if (!input || typeof input !== "object") {
        return "Question details are required.";
    }
    const { topic, type, questionText, options, points, difficulty } = input;

    if (
        typeof topic !== "string" ||
        !topic.trim() ||
        typeof questionText !== "string" ||
        !questionText.trim() ||
        !["multiple_choice", "true_false"].includes(type) ||
        !Array.isArray(options)
    ) {
        return "Topic, type, question text and options are required.";
    }

    if (type === "true_false") {
        const optionTexts = options.map((option: any) =>
            typeof option?.text === "string"
                ? option.text.trim().toLowerCase()
                : ""
        );
        if (options.length !== 2 || !optionTexts.includes("true") || !optionTexts.includes("false")) {
            return "True/false questions must have exactly True and False options.";
        }
    } else if (options.length < 2) {
        return "Multiple-choice questions need at least two options.";
    }

    const optionTexts = options.map((option: any) =>
        typeof option?.text === "string" ? option.text.trim().toLowerCase() : ""
    );
    if (
        options.filter((option: any) => option?.isCorrect === true).length !== 1 ||
        optionTexts.some((text: string) => !text) ||
        new Set(optionTexts).size !== optionTexts.length
    ) {
        return "Options must be non-empty and unique, with exactly one correct answer.";
    }

    if (points !== undefined && (!Number.isInteger(points) || points < 1)) {
        return "Points must be a positive integer.";
    }
    if (difficulty && !["easy", "medium", "hard"].includes(difficulty)) {
        return "Invalid difficulty.";
    }
    return null;
}

export const createQuestion = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const validationError = validateQuestion(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const teacherId = (req as any).user.userId;
        const question = await questionModel.create({
            teacherId,
            topic: req.body.topic.trim(),
            type: req.body.type,
            questionText: req.body.questionText.trim(),
            options: req.body.options.map((option: any) => ({
                text: option.text.trim(),
                isCorrect: option.isCorrect === true
            })),
            explanation: req.body.explanation,
            points: req.body.points ?? 1,
            difficulty: req.body.difficulty ?? "medium",
            source: "manual"
        });

        return res.status(201).json({
            message: "Question created successfully",
            question
        });

    } catch (error) {
        console.error("Failed to create question:", error);
        return res.status(500).json({
            error: "Failed to create question"
        });
    }
};

export const updateQuestion = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const questionId = req.params.questionId;
        if (typeof questionId !== "string" || !mongoose.Types.ObjectId.isValid(questionId)) {
            return res.status(400).json({ error: "Invalid question ID." });
        }
        const validationError = validateQuestion(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const teacherId = (req as any).user.userId;
        const usedByExam = await examModel.exists({
            teacherId,
            questionIds: questionId
        });
        if (usedByExam) {
            return res.status(409).json({
                error: "This question is used by an assessment and cannot be edited."
            });
        }

        const question = await questionModel.findOneAndUpdate(
            { _id: questionId, teacherId },
            {
                topic: req.body.topic.trim(),
                type: req.body.type,
                questionText: req.body.questionText.trim(),
                options: req.body.options.map((option: any) => ({
                    text: option.text.trim(),
                    isCorrect: option.isCorrect === true
                })),
                explanation: req.body.explanation,
                points: req.body.points ?? 1,
                difficulty: req.body.difficulty ?? "medium"
            },
            { new: true, runValidators: true }
        );

        if (!question) {
            return res.status(404).json({ error: "Question not found." });
        }
        return res.status(200).json({ message: "Question updated successfully.", question });
    } catch (error) {
        console.error("Failed to update question:", error);
        return res.status(500).json({ error: "Failed to update question." });
    }
};

export const deleteQuestion = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const questionId = req.params.questionId;
        if (typeof questionId !== "string" || !mongoose.Types.ObjectId.isValid(questionId)) {
            return res.status(400).json({ error: "Invalid question ID." });
        }

        const teacherId = (req as any).user.userId;
        const question = await questionModel.findOne({ _id: questionId, teacherId });
        if (!question) {
            return res.status(404).json({ error: "Question not found." });
        }

        const usedByExam = await examModel.exists({
            teacherId,
            questionIds: question._id
        });
        if (usedByExam) {
            return res.status(409).json({
                error: "This question is used by an assessment and cannot be deleted."
            });
        }

        await question.deleteOne();
        return res.status(200).json({ message: "Question deleted successfully." });
    } catch (error) {
        console.error("Failed to delete question:", error);
        return res.status(500).json({ error: "Failed to delete question." });
    }
};

export const getMyQuestions = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const teacherId = (req as any).user.userId;

        const { topic } = req.query;

        const filter: any = { teacherId };

        if (topic) {
            filter.topic = topic;
        }

        const [questions, pendingDraftCount] = await Promise.all([
            questionModel.find(filter).sort({ createdAt: -1 }),
            aiDraftModel.countDocuments({ teacherId, reviewStatus: "pending" })
        ]);

        return res.status(200).json({
            count: questions.length,
            pendingDraftCount,
            questions
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            error: "Failed to retrieve questions"
        });
    }
};