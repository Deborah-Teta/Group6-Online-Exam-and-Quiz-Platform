import express from "express"
import {questionModel} from "../models/QuestionsSchema.js";
import { aiDraftModel } from "../models/AiDraftSchema.js";


export const createQuestion = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const {
            topic,
            type,
            questionText,
            options,
            explanation,
            points,
            difficulty
        } = req.body;

        if (!topic || !type || !questionText || !options) {
            return res.status(400).json({
                error: "Topic, type, question text and options are required"
            });
        }


        if (!["multiple_choice", "true_false"].includes(type)) {
            return res.status(400).json({
                error: "Invalid question type"
            });
        }

        if (!Array.isArray(options)) {
            return res.status(400).json({
                error: "Options must be an array"
            });
        }


        if (type === "true_false") {
            if (options.length !== 2) {
                return res.status(400).json({
                    error: "True/false questions must have exactly two options"
                });
            }

            const optionTexts = options.map(
                (option: any) => option.text?.trim().toLowerCase()
            );

            if (
                !optionTexts.includes("true") ||
                !optionTexts.includes("false")
            ) {
                return res.status(400).json({
                    error: "True/false options must be True and False"
                });
            }
        }

        if (type === "multiple_choice" && options.length < 2) {
            return res.status(400).json({
                error: "Multiple-choice questions need at least two options"
            });
        }


        const correctAnswers = options.filter(
            (option: any) => option.isCorrect === true
        );

        if (correctAnswers.length !== 1) {
            return res.status(400).json({
                error: "Exactly one option must be correct"
            });
        }


        const optionTexts = options.map((option: any) =>
            option.text?.trim().toLowerCase()
        );

        if (
            optionTexts.some((text: any) => !text) ||
            new Set(optionTexts).size !== optionTexts.length
        ) {
            return res.status(400).json({
                error: "Options must be non-empty and unique"
            });
        }

        if (
            points !== undefined &&
            (!Number.isInteger(points) || points < 1)
        ) {
            return res.status(400).json({
                error: "Points must be a positive integer"
            });
        }

        if (
            difficulty &&
            !["easy", "medium", "hard"].includes(difficulty)
        ) {
            return res.status(400).json({
                error: "Invalid difficulty"
            });
        }


        const teacherId = (req as any).user.userId;


        const question = await questionModel.create({
            teacherId,
            topic,
            type,
            questionText,
            options,
            explanation,
            points: points ?? 1,
            difficulty: difficulty ?? "medium",
            source: "manual"
        });

        return res.status(201).json({
            message: "Question created successfully",
            question
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            error: "Failed to create question"
        });
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

export const updateQuestion = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { questionId } = req.params;
        const teacherId = (req as any).user.userId;

        if (typeof questionId !== "string") {
            return res.status(400).json({ error: "Invalid question ID" });
        }

        const {
            topic,
            type,
            questionText,
            options,
            explanation,
            points,
            difficulty
        } = req.body;

        const updateData: any = {};
        if (topic) updateData.topic = topic;
        if (type) updateData.type = type;
        if (questionText) updateData.questionText = questionText;
        if (options) updateData.options = options;
        if (explanation !== undefined) updateData.explanation = explanation;
        if (points !== undefined) updateData.points = points;
        if (difficulty) updateData.difficulty = difficulty;

        const question = await questionModel.findOneAndUpdate(
            { _id: questionId, teacherId },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!question) {
            return res.status(404).json({ error: "Question not found" });
        }

        return res.status(200).json({
            message: "Question updated successfully",
            question
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to update question" });
    }
};

export const deleteQuestion = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { questionId } = req.params;
        const teacherId = (req as any).user.userId;

        if (typeof questionId !== "string") {
            return res.status(400).json({ error: "Invalid question ID" });
        }

        const question = await questionModel.findOneAndDelete({
            _id: questionId,
            teacherId
        });

        if (!question) {
            return res.status(404).json({ error: "Question not found" });
        }

        return res.status(200).json({
            message: "Question deleted successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to delete question" });
    }
};