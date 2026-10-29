import mongoose, { Schema, Document } from "mongoose";

export interface IAnswer {
    questionId: mongoose.Types.ObjectId;
    selectedOptionIndex: number | null;
    isCorrect?: boolean;
    awardedPoints?: number;
}