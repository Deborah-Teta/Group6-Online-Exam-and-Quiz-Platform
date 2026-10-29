import mongoose, { Schema, Document } from "mongoose";

export interface IAnswer {
    questionId: mongoose.Types.ObjectId;
    selectedOptionIndex: number | null;
    isCorrect?: boolean;
    awardedPoints?: number;
}

export interface IExamAttempt extends Document {
    examId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    answers: IAnswer[];
    startedAt: Date;
    submittedAt?: Date;
    status: "in_progress" | "submitted" | "auto_submitted";
    score: number;
    totalPoints: number;
    percentage: number;
}

const answerSchema = new Schema<IAnswer>(
    {
        questionId: {
            type: Schema.Types.ObjectId,
            ref: "Question",
            required: true,
        },
        selectedOptionIndex: {
            type: Number,
            default: null,
            min: 0,
        },
        isCorrect: Boolean,
        awardedPoints: {
            type: Number,
            min: 0,
        },
    },
    { _id: false }
);
