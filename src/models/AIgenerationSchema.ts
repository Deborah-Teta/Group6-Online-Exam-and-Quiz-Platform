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


const aiGenerationSchema = new Schema<IAIGeneration>(
    {
        teacherId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index:true
        },
        sourceNotes: {
            type: String,
            required: true,
        },
        requestedCount: {
            type: Number,
            required: true,
            min: 1,
            max: 10,
        },
        questionType: {
            type: String,
            enum: ["multiple_choice", "true_false"],
            required: true,
        },
        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
        },
        generatedCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        acceptedCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        errorMessage: String,
    },
    { timestamps: true }
);

export const aiGenerationModel = mongoose.model<IAIGeneration>("AiGeneration", aiGenerationSchema);