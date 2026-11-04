import express from "express";
import mongoose from "mongoose";

import { userModel } from "../models/UserSchema.js";
import { classModel } from "../models/ClassSchema.js";
import { examModel } from "../models/ExamSchema.js";
import {auditLogModel} from "../models/AuditLog.js";
import {aiGenerationModel} from "../models/AIgenerationSchema.js";


export const getAllUsers = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const users = await userModel
            .find()
            .select("-password -resetPasswordToken -resetPasswordExpires")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            total: users.length,
            users
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to retrieve users." });
    }
};

export const blockUser = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID." });
        }

        if (!reason || !reason.trim()) {
            return res.status(400).json({
                error: "A reason is required to block an account."
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        if (user.role === "admin") {
            return res.status(403).json({
                error: "Admin accounts cannot be blocked through this endpoint."
            });
        }

        if (user.isBlocked) {
            return res.status(409).json({ error: "User is already blocked." });
        }

        user.isBlocked = true;
        user.blockedReason = reason.trim();
        await user.save();

        await auditLogModel.create({
            adminId: (req as any).user.userId,
            targetUserId: user._id,
            action: "block_user",
            reason: reason.trim()
        });

        return res.status(200).json({
            message: "User blocked successfully.",
            userId: user._id
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to block user." });
    }
};

export const unblockUser = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID." });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        user.isBlocked = false;
        user.blockedReason = undefined;
        await user.save();

        await auditLogModel.create({
            adminId: (req as any).user.userId,
            targetUserId: user._id,
            action: "unblock_user"
        });

        return res.status(200).json({
            message: "User unblocked successfully."
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to unblock user." });
    }
};


export const getAllClasses = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const classes = await classModel
            .find()
            .populate("teacherId", "fullName email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            total: classes.length,
            classes
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to retrieve classes." });
    }
};


export const getPlatformStats = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const now = new Date();


        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay();

        startOfWeek.setDate(
            startOfWeek.getDate() - (day === 0 ? 6 : day - 1)
        );
        startOfWeek.setHours(0, 0, 0, 0);

        const [
            teachers,
            students,
            examsThisWeek,
            aiGenerationsUsed
        ] = await Promise.all([
            userModel.countDocuments({ role: "teacher" }),
            userModel.countDocuments({ role: "student" }),
            examModel.countDocuments({
                createdAt: { $gte: startOfWeek }
            }),
            aiGenerationModel.countDocuments({
                status: "completed"
            })
        ]);

        return res.status(200).json({
            teachers,
            students,
            examsThisWeek,
            aiGenerationsUsed
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Failed to retrieve platform statistics."
        });
    }
};