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


const examAttemptSchema = new Schema<IExamAttempt>(
    {
        examId: {
            type: Schema.Types.ObjectId,
            ref: "Exam",
            required: true,
            index:true,
        },
        studentId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index:true,
        },
        answers: {
            type: [answerSchema],
            default: [],
        },
        startedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
        submittedAt: Date,
        status: {
            type: String,
            enum: ["in_progress", "submitted", "auto_submitted"],
            default: "in_progress",
        },
        score: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalPoints: {
            type: Number,
            required: true,
            min: 0,
        },
        percentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
    },
    { timestamps: true }
);



export const examAttemptModel = mongoose.model<IExamAttempt>("ExamAttempt",examAttemptSchema);
