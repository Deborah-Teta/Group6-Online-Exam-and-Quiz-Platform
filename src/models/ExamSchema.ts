import mongoose, { Schema, Document } from "mongoose";

export interface IExam extends Document {
    teacherId: mongoose.Types.ObjectId;
    classId: mongoose.Types.ObjectId;
    title: string;
    instructions?: string;
    questionIds: mongoose.Types.ObjectId[];
    startTime: Date;
    durationMinutes: number;
    status: "draft" | "scheduled" | "published" | "closed";
    showAnswersAfterClose: boolean;
}