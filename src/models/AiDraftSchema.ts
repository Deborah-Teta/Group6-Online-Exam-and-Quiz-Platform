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
