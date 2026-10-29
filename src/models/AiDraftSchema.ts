import mongoose, { Schema, Document } from "mongoose";

export interface IAIDraft extends Document {
    generationId: mongoose.Types.ObjectId;
    teacherId: mongoose.Types.ObjectId;
    type: "multiple_choice" | "true_false";
    questionText: string;
    options: {
        text: string;
        isCorrect: boolean;
    }[];
    explanation?: string;
    difficulty: "easy" | "medium" | "hard";
    points: number;
    reviewStatus: "pending" | "approved" | "rejected";
    reviewedAt?: Date;
}


const aiDraftSchema = new Schema<IAIDraft>(
    {
        generationId: {
            type: Schema.Types.ObjectId,
            ref: "AIGeneration",
            required: true,
        },
        teacherId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index:true
        },
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
            type: [
                {
                    text: { type: String, required: true, trim: true },
                    isCorrect: { type: Boolean, required: true },
                },
            ],
            required: true,
            validate: {
                validator: (options: { text: string; isCorrect: boolean }[]) =>
                    options.length >= 2 &&
                    options.filter((o) => o.isCorrect).length === 1 &&
                    new Set(options.map((o) => o.text.trim().toLowerCase())).size ===
                    options.length,
                message: "Draft options must be unique with one correct answer.",
            },
        },
        explanation: String,
        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "medium",
        },
        points: {
            type: Number,
            min: 1,
            default: 1,
        },
        reviewStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index:true
        },
        reviewedAt: Date,
    },
    { timestamps: true }
);

export const aiDraftModel = mongoose.model<IAIDraft>("AIDraft", aiDraftSchema);