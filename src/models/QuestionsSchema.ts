import mongoose, { Schema, Document } from "mongoose";

export interface IOption {
    text: string;
    isCorrect: boolean;
}

export interface IQuestion extends Document {
    teacherId: mongoose.Types.ObjectId;
    topic: string;
    type: "multiple_choice" | "true_false";
    questionText: string;
    options: IOption[];
    explanation?: string;
    points: number;
    difficulty: "easy" | "medium" | "hard";
    source: "manual" | "ai";
}

const optionSchema = new Schema<IOption>(
    {
        text: { type: String, required: true, trim: true },
        isCorrect: { type: Boolean, required: true },
    },
    { _id: false }
);

const questionSchema = new Schema<IQuestion>(
    {
        teacherId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        topic: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: ["multiple_choice", "true_false"],
            required: true,
        },
        questionText: {
            type: String,
            required: true,
            trim: true,
        },
        options: {
            type: [optionSchema],
            required: true,
            validate: {
                validator: (options: IOption[]) =>
                    options.length >= 2 &&
                    options.filter((option) => option.isCorrect).length === 1 &&
                    new Set(options.map((o) => o.text.trim().toLowerCase())).size ===
                    options.length,
                message: "Provide unique options and exactly one correct answer.",
            },
        },
        explanation: String,
        points: {
            type: Number,
            required: true,
            min: 1,
        },
        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "medium",
        },
        source: {
            type: String,
            enum: ["manual", "ai"],
            default: "manual",
        },
    },
    { timestamps: true }
);
