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
