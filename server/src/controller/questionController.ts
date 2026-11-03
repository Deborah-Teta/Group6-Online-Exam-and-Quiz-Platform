import express from "express"
import {questionModel} from "../models/QuestionsSchema.js";


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