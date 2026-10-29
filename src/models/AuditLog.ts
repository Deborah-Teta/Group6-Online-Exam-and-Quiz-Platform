import mongoose, { Schema, Document } from "mongoose";
export interface IAuditLog extends Document {
    adminId: mongoose.Types.ObjectId;
    targetUserId: mongoose.Types.ObjectId;
    action: "approve_teacher" | "reject_teacher"
        | "block_user"
        | "unblock_user";
    reason?: string;
}