import express from "express";
import mongoose from "mongoose";
import { userModel } from "../models/UserSchema.js";
import {auditLogModel} from "../models/AuditLog.js";



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
            .sort({ createdAt: 1 });

        return res.status(200).json({
            count: teachers.length,
            teachers
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            error: "Failed to get pending teachers"
        });
    }
};


export const approveTeacher = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { teacherId } = req.params;
        if (typeof teacherId !== "string") {
            return res.status(400).json({
                message: "Invalid teacher ID"
            });
        }

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


        const adminId = (req as any).user.userId;

        await auditLogModel.create({
            adminId,
            targetUserId: teacher._id,
            action: "approve_teacher",
            reason: "Teacher account approved"
        });

        return res.status(200).json({
            message: "Teacher approved successfully",
            teacher
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            error: "Failed to approve teacher"
        });
    }
};