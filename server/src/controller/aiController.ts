
import { Request, Response } from "express";
import mongoose from "mongoose";
import {aiGenerationModel} from "../models/AIgenerationSchema.js";
import {generateQuestions} from "../services/geminiService.js";
import {aiDraftModel} from "../models/AiDraftSchema.js";
import {questionModel} from "../models/QuestionsSchema.js";




const DAILY_AI_LIMIT = 10;

const normalizeText = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, " ");

export const generateAIDrafts = async (req: Request, res: Response) => {
    let generation: any = null;

    try {
        const teacherId = (req as any).user?.userId;

        if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(401).json({
                message: "Invalid teacher authentication."
            });
        }

        const {
            topic,
            sourceNotes,
            requestedCount,
            questionType,
            difficulty
        } = req.body;


        if (
            typeof topic !== "string" ||
            !topic.trim() ||
            typeof sourceNotes !== "string" ||
            !sourceNotes.trim()
        ) {
            return res.status(400).json({
                message: "Topic and lesson notes are required."
            });
        }

        if (
            !Number.isInteger(requestedCount) ||
            requestedCount < 1 ||
            requestedCount > 10
        ) {
            return res.status(400).json({
                message: "You can generate between 1 and 10 questions."
            });
        }

        if (!["multiple_choice", "true_false"].includes(questionType)) {
            return res.status(400).json({
                message: "Invalid question type."
            });
        }

        if (!["easy", "medium", "hard"].includes(difficulty)) {
            return res.status(400).json({
                message: "Invalid difficulty."
            });
        }

        if (sourceNotes.trim().length > 20000) {
            return res.status(400).json({
                message: "Lesson notes cannot exceed 20,000 characters."
            });
        }

        // Calculate today's UTC boundaries
        const now = new Date();

        const startOfDay = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate()
        ));

        const endOfDay = new Date(
            startOfDay.getTime() + 24 * 60 * 60 * 1000
        );

        // Count today's generation requests
        const generationsToday = await aiGenerationModel.countDocuments({
            teacherId,
            createdAt: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        });

        if (generationsToday >= DAILY_AI_LIMIT) {
            return res.status(429).json({
                message: "You have reached your daily AI generation limit. Try again tomorrow.",
                dailyLimit: DAILY_AI_LIMIT,
                used: generationsToday
            });
        }

        // Create generation record before calling Gemini
        generation = await aiGenerationModel.create({
            teacherId,
            topic: topic.trim(),
            sourceNotes: sourceNotes.trim(),
            requestedCount,
            questionType,
            difficulty,
            status: "pending"
        });

        // Generate questions using Gemini
        const generatedQuestions = await generateQuestions({
            sourceNotes: sourceNotes.trim(),
            requestedCount,
            questionType,
            difficulty
        });

        // Validate Gemini response
        if (!Array.isArray(generatedQuestions)) {
            throw new Error("Invalid AI response.");
        }

        const validDrafts = [];
        const seenQuestions = new Set<string>();

        for (const question of generatedQuestions) {
            if (validDrafts.length >= requestedCount) {
                break;
            }

            if (
                !question ||
                question.type !== questionType ||
                typeof question.questionText !== "string" ||
                !question.questionText.trim() ||
                !Array.isArray(question.options) ||
                typeof question.explanation !== "string" ||
                !question.explanation.trim() ||
                question.difficulty !== difficulty ||
                !Number.isInteger(question.points) ||
                question.points < 1
            ) {
                continue;
            }

            const normalizedQuestion = normalizeText(question.questionText);

            if (seenQuestions.has(normalizedQuestion)) {
                continue;
            }

            // Validate options
            if (
                question.options.length < 2 ||
                question.options.some(
                    option =>
                        !option ||
                        typeof option.text !== "string" ||
                        !option.text.trim() ||
                        typeof option.isCorrect !== "boolean"
                )
            ) {
                continue;
            }

            const normalizedOptions = question.options.map(
                option => normalizeText(option.text)
            );

            const uniqueOptions = new Set(normalizedOptions);

            if (uniqueOptions.size !== question.options.length) {
                continue;
            }

            const correctAnswers = question.options.filter(
                option => option.isCorrect
            );

            if (correctAnswers.length !== 1) {
                continue;
            }

            // True/false must contain exactly True and False
            if (questionType === "true_false") {
                if (
                    question.options.length !== 2 ||
                    !normalizedOptions.includes("true") ||
                    !normalizedOptions.includes("false")
                ) {
                    continue;
                }
            }

            seenQuestions.add(normalizedQuestion);

            validDrafts.push({
                generationId: generation._id,
                teacherId,
                topic: topic.trim(),
                type: question.type,
                questionText: question.questionText.trim(),
                options: question.options.map(option => ({
                    text: option.text.trim(),
                    isCorrect: option.isCorrect
                })),
                explanation: question.explanation.trim(),
                difficulty: question.difficulty,
                points: question.points,
                reviewStatus: "pending"
            });
        }

        // Save valid drafts only
        let savedDrafts: any[] = [];

        if (validDrafts.length > 0) {
            savedDrafts = await aiDraftModel.insertMany(validDrafts);
        }

        // Update generation record
        await aiGenerationModel.findByIdAndUpdate(generation._id, {
            status: "completed",
            generatedCount: savedDrafts.length
        });

        return res.status(201).json({
            message: savedDrafts.length > 0
                ? "AI questions generated successfully. Review every answer before approval."
                : "Gemini could not generate any valid questions from these notes. You can add questions manually.",
            generationId: generation._id,
            requestedCount,
            generatedCount: savedDrafts.length,
            dailyLimit: DAILY_AI_LIMIT,
            used: generationsToday + 1,
            drafts: savedDrafts
        });

    } catch (error) {
        console.error("AI generation error:", error);

        if (generation?._id) {
            await aiGenerationModel.findByIdAndUpdate(generation._id, {
                status: "failed",
                errorMessage: "AI generation failed."
            });
        }

        return res.status(500).json({
            message: "Unable to generate questions right now. Please try again or add questions manually."
        });
    }
};



export const getAIDrafts = async (req: Request, res: Response) => {
    try {
        const teacherId = (req as any).user?.userId;
        const { generationId } = req.params;

        if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(401).json({
                message: "Invalid teacher authentication."
            });
        }

        if (
            typeof generationId !== "string" ||
            !mongoose.Types.ObjectId.isValid(generationId)
        ) {
            return res.status(400).json({
                message: "Invalid generation ID."
            });
        }

        // Confirm this generation belongs to the logged-in teacher
        const generation = await aiGenerationModel.findOne({
            _id: generationId,
            teacherId
        });

        if (!generation) {
            return res.status(404).json({
                message: "Generation not found."
            });
        }

        // Retrieve drafts belonging to this generation and teacher
        const drafts = await aiDraftModel.find({
            generationId,
            teacherId
        }).sort({ createdAt: 1 });

        return res.status(200).json({
            message: "AI drafts retrieved successfully.",
            generationId,
            count: drafts.length,
            drafts
        });

    } catch (error) {
        console.error("Get AI drafts error:", error);

        return res.status(500).json({
            message: "Unable to retrieve AI drafts."
        });
    }
};


export const updateAIDraft = async (req: Request, res: Response) => {
    try {
        const teacherId = (req as any).user?.userId;
        const { draftId } = req.params;

        if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(401).json({
                message: "Invalid teacher authentication."
            });
        }

        if (
            typeof draftId !== "string" ||
            !mongoose.Types.ObjectId.isValid(draftId)
        ) {
            return res.status(400).json({
                message: "Invalid draft ID."
            });
        }

        const draft = await aiDraftModel.findOne({
            _id: draftId,
            teacherId
        });

        if (!draft) {
            return res.status(404).json({
                message: "AI draft not found."
            });
        }

        if (draft.reviewStatus !== "pending") {
            return res.status(400).json({
                message: "Only pending drafts can be edited."
            });
        }

        const {
            questionText,
            options,
            explanation,
            difficulty,
            points
        } = req.body;

        if (
            typeof questionText !== "string" ||
            !questionText.trim() ||
            typeof explanation !== "string" ||
            !explanation.trim() ||
            !Array.isArray(options) ||
            !["easy", "medium", "hard"].includes(difficulty) ||
            !Number.isInteger(points) ||
            points < 1
        ) {
            return res.status(400).json({
                message: "Invalid draft information."
            });
        }

        if (options.length < 2) {
            return res.status(400).json({
                message: "At least two options are required."
            });
        }

        const normalizedOptions = options.map((option: any) => ({
            text: typeof option.text === "string" ? option.text.trim() : "",
            isCorrect: option.isCorrect
        }));

        if (
            normalizedOptions.some(
                (option: any) =>
                    !option.text ||
                    typeof option.isCorrect !== "boolean"
            )
        ) {
            return res.status(400).json({
                message: "Every option must have text and a correct-answer status."
            });
        }

        const correctAnswers = normalizedOptions.filter(
            (option: any) => option.isCorrect
        );

        if (correctAnswers.length !== 1) {
            return res.status(400).json({
                message: "Exactly one option must be correct."
            });
        }

        const uniqueOptions = new Set(
            normalizedOptions.map((option: any) =>
                option.text.toLowerCase()
            )
        );

        if (uniqueOptions.size !== normalizedOptions.length) {
            return res.status(400).json({
                message: "Options must not contain duplicates."
            });
        }

        draft.questionText = questionText.trim();
        draft.options = normalizedOptions;
        draft.explanation = explanation.trim();
        draft.difficulty = difficulty;
        draft.points = points;

        await draft.save();

        return res.status(200).json({
            message: "AI draft updated successfully.",
            draft
        });

    } catch (error) {
        console.error("Update AI draft error:", error);

        return res.status(500).json({
            message: "Unable to update AI draft."
        });
    }
};


export const getAllAIDrafts = async (req: Request, res: Response) => {
    try {
        const teacherId = (req as any).user?.userId;

        if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(401).json({ message: "Invalid teacher authentication." });
        }

        const { reviewStatus, topic, page = "1", limit = "10" } = req.query;

        const pageNumber = Math.max(1, Number(page) || 1);
        const pageSize = Math.min(50, Math.max(1, Number(limit) || 10));

        const filter: any = { teacherId };

        if (reviewStatus) {
            if (!["pending", "approved", "rejected"].includes(String(reviewStatus))) {
                return res.status(400).json({ message: "Invalid review status." });
            }
            filter.reviewStatus = reviewStatus;
        }

        if (topic) {
            filter.topic = {
                $regex: String(topic),
                $options: "i"
            };
        }

        const [drafts, total] = await Promise.all([
            aiDraftModel.find(filter)
                .sort({ createdAt: -1 })
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize),

            aiDraftModel.countDocuments(filter)
        ]);

        return res.status(200).json({
            message: "AI drafts retrieved successfully.",
            total,
            page: pageNumber,
            limit: pageSize,
            totalPages: Math.ceil(total / pageSize),
            drafts
        });

    } catch (error) {
        console.error("Get all AI drafts error:", error);
        return res.status(500).json({ message: "Unable to retrieve AI drafts." });
    }
};

export const approveAIDraft = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();

    try {
        const teacherId = (req as any).user?.userId;
        const { draftId } = req.params;

        if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(401).json({ message: "Invalid teacher authentication." });
        }

        if (typeof draftId !== "string" || !mongoose.Types.ObjectId.isValid(draftId)) {
            return res.status(400).json({ message: "Invalid draft ID." });
        }

        let createdQuestion: any = null;

        await session.withTransaction(async () => {
            const draft = await aiDraftModel.findOne({
                _id: draftId,
                teacherId,
                reviewStatus: "pending"
            }).session(session);

            if (!draft) {
                throw new Error("DRAFT_NOT_PENDING");
            }

            // Revalidate before creating the permanent question.
            if (
                !draft.questionText.trim() ||
                draft.options.length < 2 ||
                draft.options.filter(o => o.isCorrect).length !== 1
            ) {
                throw new Error("INVALID_DRAFT");
            }

            const normalized = draft.options.map(o => o.text.trim().toLowerCase());

            if (new Set(normalized).size !== normalized.length) {
                throw new Error("INVALID_DRAFT");
            }

            if (draft.type === "true_false") {
                const values = normalized.slice().sort();

                if (
                    values.length !== 2 ||
                    values[0] !== "false" ||
                    values[1] !== "true"
                ) {
                    throw new Error("INVALID_DRAFT");
                }
            }

            const questions = await questionModel.create(
                [{
                    teacherId: draft.teacherId,
                    topic: draft.topic,
                    type: draft.type,
                    questionText: draft.questionText,
                    options: draft.options.map(o => ({
                        text: o.text,
                        isCorrect: o.isCorrect
                    })),
                    explanation: draft.explanation,
                    difficulty: draft.difficulty,
                    points: draft.points,
                    source: "ai"
                }],
                { session }
            );

            createdQuestion = questions[0];

            const updatedDraft = await aiDraftModel.findOneAndUpdate(
                {
                    _id: draftId,
                    teacherId,
                    reviewStatus: "pending"
                },
                {
                    $set: {
                        reviewStatus: "approved",
                        reviewedAt: new Date()
                    }
                },
                { new: true, session }
            );

            if (!updatedDraft) {
                throw new Error("DRAFT_NOT_PENDING");
            }

            await aiGenerationModel.updateOne(
                { _id: draft.generationId, teacherId },
                { $inc: { acceptedCount: 1 } },
                { session }
            );
        });


        return res.status(201).json({
            message: "AI draft approved and saved as a question.",
            question: createdQuestion
        });

    } catch (error: any) {
        console.error("Approve AI draft error:", error);

        if (error.message === "DRAFT_NOT_PENDING") {
            return res.status(409).json({
                message: "Draft not found, or it has already been reviewed."
            });
        }

        if (error.message === "INVALID_DRAFT") {
            return res.status(400).json({
                message: "Draft is invalid and cannot be approved."
            });
        }

        return res.status(500).json({
            message: "Unable to approve AI draft. Check that MongoDB transactions are supported."
        });

    } finally {
        await session.endSession();
    }
};

export const rejectAIDraft = async (req: Request, res: Response) => {
    try {
        const teacherId = (req as any).user?.userId;
        const { draftId } = req.params;

        if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(401).json({ message: "Invalid teacher authentication." });
        }

        if (typeof draftId !== "string" || !mongoose.Types.ObjectId.isValid(draftId)) {
            return res.status(400).json({ message: "Invalid draft ID." });
        }

        const draft = await aiDraftModel.findOneAndUpdate(
            { _id: draftId, teacherId, reviewStatus: "pending" },
            {
                $set: {
                    reviewStatus: "rejected",
                    reviewedAt: new Date()
                }
            },
            { new: true }
        );

        if (!draft) {
            return res.status(404).json({
                message: "Pending AI draft not found."
            });
        }

        return res.status(200).json({
            message: "AI draft rejected successfully.",
            draft
        });

    } catch (error) {
        console.error("Reject AI draft error:", error);
        return res.status(500).json({ message: "Unable to reject AI draft." });
    }
};


export const deleteAIDraft = async (req: Request, res: Response) => {
    try {
        const teacherId = (req as any).user?.userId;
        const { draftId } = req.params;

        if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(401).json({ message: "Invalid teacher authentication." });
        }

        if (typeof draftId !== "string" || !mongoose.Types.ObjectId.isValid(draftId)) {
            return res.status(400).json({ message: "Invalid draft ID." });
        }

        const draft = await aiDraftModel.findOneAndDelete({
            _id: draftId,
            teacherId,
            reviewStatus: "pending"
        });

        if (!draft) {
            return res.status(404).json({
                message: "Pending AI draft not found."
            });
        }

        return res.status(200).json({
            message: "AI draft deleted successfully."
        });

    } catch (error) {
        console.error("Delete AI draft error:", error);
        return res.status(500).json({ message: "Unable to delete AI draft." });
    }
};


export const getAIGenerations = async (req: Request, res: Response) => {
    try {
        const teacherId = (req as any).user?.userId;

        if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(401).json({ message: "Invalid teacher authentication." });
        }

        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

        const filter = { teacherId };

        const [generations, total] = await Promise.all([
            aiGenerationModel.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),

            aiGenerationModel.countDocuments(filter)
        ]);

        return res.status(200).json({
            message: "AI generation history retrieved successfully.",
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            generations
        });

    } catch (error) {
        console.error("Get AI generations error:", error);
        return res.status(500).json({
            message: "Unable to retrieve AI generation history."
        });
    }
};


export const getAIGenerationById = async (req: Request, res: Response) => {
    try {
        const teacherId = (req as any).user?.userId;
        const { generationId } = req.params;

        if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(401).json({ message: "Invalid teacher authentication." });
        }

        if (
            typeof generationId !== "string" ||
            !mongoose.Types.ObjectId.isValid(generationId)
        ) {
            return res.status(400).json({ message: "Invalid generation ID." });
        }

        const generation = await aiGenerationModel.findOne({
            _id: generationId,
            teacherId
        });

        if (!generation) {
            return res.status(404).json({ message: "Generation not found." });
        }

        const [pending, approved, rejected] = await Promise.all([
            aiDraftModel.countDocuments({ generationId, teacherId, reviewStatus: "pending" }),
            aiDraftModel.countDocuments({ generationId, teacherId, reviewStatus: "approved" }),
            aiDraftModel.countDocuments({ generationId, teacherId, reviewStatus: "rejected" })
        ]);

        return res.status(200).json({
            message: "Generation retrieved successfully.",
            generation,
            statistics: {
                pending,
                approved,
                rejected,
                total: pending + approved + rejected
            }
        });

    } catch (error) {
        console.error("Get AI generation error:", error);
        return res.status(500).json({
            message: "Unable to retrieve generation."
        });
    }
};