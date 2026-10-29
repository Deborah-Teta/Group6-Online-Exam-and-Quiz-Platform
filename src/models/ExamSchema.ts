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

const examSchema = new Schema<IExam>(
    {
        teacherId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        classId: {
            type: Schema.Types.ObjectId,
            ref: "Class",
            required: true,
            index:true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        instructions: String,
        questionIds: {
            type: [{ type: Schema.Types.ObjectId, ref: "Question" }],
            required: true,
            validate: {
                validator: (ids: mongoose.Types.ObjectId[]) =>
                    ids.length > 0 && new Set(ids.map(String)).size === ids.length,
                message: "An exam needs unique question IDs.",
            },
        },
        startTime: {
            type: Date,
            required: true,
            index:true,
        },
        durationMinutes: {
            type: Number,
            required: true,
            min: 1,
        },
        status: {
            type: String,
            enum: ["draft", "scheduled", "published", "closed"],
            default: "draft",
        },
        showAnswersAfterClose: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);