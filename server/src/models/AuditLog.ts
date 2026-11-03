import mongoose, { Schema, Document } from "mongoose";
export interface IAuditLog extends Document {
    adminId: mongoose.Types.ObjectId;
    targetUserId: mongoose.Types.ObjectId;
    action: "approve_teacher" | "reject_teacher" | "block_user" | "unblock_user";
    reason?: string;
}

const auditLogSchema = new Schema<IAuditLog>(
    {
        adminId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        targetUserId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index:true,
        },
        action: {
            type: String,
            enum: [
                "approve_teacher",
                "reject_teacher",
                "block_user",
                "unblock_user",
            ],
            required: true,
        },
        reason: String,
    },
    { timestamps: true }
);


export const auditLogModel = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);