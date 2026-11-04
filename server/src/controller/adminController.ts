import express from "express";
import mongoose from "mongoose";
import { userModel } from "../models/UserSchema.js";
import { auditLogModel } from "../models/AuditLog.js";
import { classModel } from "../models/ClassSchema.js";
import { examModel } from "../models/ExamSchema.js";
import { aiGenerationModel } from "../models/AIgenerationSchema.js";

// 1. Get Platform Stats (Teachers, Students, Exams this week, AI Generations)
export const getPlatformStats = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const totalTeachers = await userModel.countDocuments({ role: "teacher" });
        const pendingTeachers = await userModel.countDocuments({ role: "teacher", approvalStatus: "pending" });
        const approvedTeachers = await userModel.countDocuments({ role: "teacher", approvalStatus: "approved" });
        const totalStudents = await userModel.countDocuments({ role: "student" });
        const blockedUsers = await userModel.countDocuments({ isBlocked: true });

        // Exams this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const examsThisWeek = await examModel.countDocuments({
            createdAt: { $gte: oneWeekAgo }
        }).catch(() => 0);

        // AI generations count
        const aiGenerationsCount = await aiGenerationModel.countDocuments().catch(() => 0);
        const totalClasses = await classModel.countDocuments().catch(() => 0);

        return res.status(200).json({
            stats: {
                totalTeachers,
                pendingTeachers,
                approvedTeachers,
                totalStudents,
                blockedUsers,
                examsThisWeek,
                aiGenerations: aiGenerationsCount,
                totalClasses
            }
        });
    } catch (error) {
        console.error("Failed to get platform stats:", error);
        return res.status(500).json({ error: "Failed to fetch platform stats" });
    }
};

// 2. Get Pending Teachers
export const getPendingTeachers = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const teachers = await userModel.find({
            role: "teacher",
            approvalStatus: "pending"
        })
            .select("-password -resetCode -resetCodeExpires")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: teachers.length,
            teachers
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to get pending teachers"
        });
    }
};

// 3. Approve Teacher
export const approveTeacher = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { teacherId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(400).json({
                error: "Invalid teacher ID"
            });
        }

        const teacher = await userModel.findOneAndUpdate(
            {
                _id: teacherId,
                role: "teacher",
                approvalStatus: "pending"
            },
            {
                $set: {
                    approvalStatus: "approved"
                }
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password -resetCode -resetCodeExpires");

        if (!teacher) {
            return res.status(404).json({
                error: "Teacher not found or already processed"
            });
        }

        const adminId = (req as any).user?.userId;
        if (adminId) {
            await auditLogModel.create({
                adminId,
                targetUserId: teacher._id,
                action: "approve_teacher",
                reason: "Teacher account approved by administrator"
            });
        }

        return res.status(200).json({
            message: "Teacher approved successfully",
            teacher
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to approve teacher"
        });
    }
};

// 4. Reject Teacher
export const rejectTeacher = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { teacherId } = req.params;
        const { reason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(400).json({ error: "Invalid teacher ID" });
        }

        const teacher = await userModel.findOneAndUpdate(
            {
                _id: teacherId,
                role: "teacher",
                approvalStatus: "pending"
            },
            {
                $set: {
                    approvalStatus: "rejected",
                    blockedReason: reason || "Teacher registration request rejected"
                }
            },
            { new: true }
        ).select("-password -resetCode -resetCodeExpires");

        if (!teacher) {
            return res.status(404).json({ error: "Teacher not found or already processed" });
        }

        const adminId = (req as any).user?.userId;
        if (adminId) {
            await auditLogModel.create({
                adminId,
                targetUserId: teacher._id,
                action: "reject_teacher",
                reason: reason || "Teacher application rejected"
            });
        }

        return res.status(200).json({
            message: "Teacher rejected",
            teacher
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to reject teacher" });
    }
};

// 5. Get All Users (with filter and search)
export const getAllUsers = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { role, status, search } = req.query;
        const filter: any = {};

        if (role && role !== "all") {
            filter.role = role;
        }

        if (status && status !== "all") {
            if (status === "blocked") {
                filter.isBlocked = true;
            } else if (status === "pending" || status === "approved" || status === "rejected") {
                filter.approvalStatus = status;
            }
        }

        if (search) {
            const searchRegex = new RegExp(String(search), "i");
            filter.$or = [
                { fullName: searchRegex },
                { email: searchRegex }
            ];
        }

        const users = await userModel.find(filter)
            .select("-password -resetCode -resetCodeExpires")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: users.length,
            users
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch users" });
    }
};

// 6. Block User Account with a Reason
export const blockUser = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        if (!reason || reason.trim() === "") {
            return res.status(400).json({ error: "A valid reason is required to block an account" });
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            {
                $set: {
                    isBlocked: true,
                    blockedReason: reason.trim()
                }
            },
            { new: true }
        ).select("-password -resetCode -resetCodeExpires");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const adminId = (req as any).user?.userId;
        if (adminId) {
            await auditLogModel.create({
                adminId,
                targetUserId: user._id,
                action: "block_user",
                reason: reason.trim()
            });
        }

        return res.status(200).json({
            message: "User blocked successfully",
            user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to block user" });
    }
};

// 7. Unblock User Account
export const unblockUser = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            {
                $set: {
                    isBlocked: false,
                    blockedReason: ""
                }
            },
            { new: true }
        ).select("-password -resetCode -resetCodeExpires");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const adminId = (req as any).user?.userId;
        if (adminId) {
            await auditLogModel.create({
                adminId,
                targetUserId: user._id,
                action: "unblock_user",
                reason: "Account unblocked by administrator"
            });
        }

        return res.status(200).json({
            message: "User unblocked successfully",
            user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to unblock user" });
    }
};

// 8. Get All Classes
export const getAllClasses = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const classes = await classModel.find()
            .populate("teacherId", "fullName email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: classes.length,
            classes
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch classes" });
    }
};

// 9. Get Audit Logs
export const getAuditLogs = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const logs = await auditLogModel.find()
            .populate("adminId", "fullName email")
            .populate("targetUserId", "fullName email role")
            .sort({ createdAt: -1 })
            .limit(100);

        return res.status(200).json({
            count: logs.length,
            logs
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch audit logs" });
    }
};
