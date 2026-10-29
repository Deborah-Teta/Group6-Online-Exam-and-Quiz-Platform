import mongoose, { Schema, Document } from "mongoose";

export interface IAIGeneration extends Document {
    teacherId: mongoose.Types.ObjectId;
    sourceNotes: string;
    requestedCount: number;
    questionType: "multiple_choice" | "true_false";
    difficulty: "easy" | "medium" | "hard";
    status: "pending" | "completed" | "failed";
    generatedCount: number;
    acceptedCount: number;
    errorMessage?: string;
}
