import express from "express";
import { classModel } from "../models/ClassSchema.js";
import crypto from "crypto";
import {classMemberModel} from "../models/ClassMember.js";
import mongoose from "mongoose";
import { examModel } from "../models/ExamSchema.js";

export const getTeacherClasses = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const teacherId = (req as any).user.userId;
        const classes = await classModel.find({ teacherId }).sort({ createdAt: -1 }).lean();
        const classIds = classes.map((item) => item._id);
        const [memberships, exams] = await Promise.all([
            classIds.length
                ? classMemberModel.aggregate([
                    { $match: { classId: { $in: classIds } } },
                    { $group: { _id: "$classId", students: { $sum: 1 } } }
                ])
                : Promise.resolve([]),
            examModel.find({
                teacherId,
                classId: { $in: classIds },
                status: { $in: ["scheduled", "published"] },
                startTime: { $gte: new Date() }
            }).select("title classId startTime durationMinutes").sort({ startTime: 1 }).lean()
        ]);
        const studentCountByClassId = new Map(
            memberships.map((membership: { _id: { toString(): string }; students: number }) => [
                membership._id.toString(),
                membership.students
            ])
        );
        const nextExamByClassId = new Map();
        for (const exam of exams) {
            const classId = exam.classId.toString();
            if (!nextExamByClassId.has(classId)) {
                nextExamByClassId.set(classId, exam);
            }
        }

        return res.status(200).json({
            classes: classes.map((item) => {
                const nextExam = nextExamByClassId.get(item._id.toString());
                return {
                    id: item._id,
                    name: item.name,
                    description: item.description || "",
                    code: item.classCode,
                    active: item.isActive,
                    students: studentCountByClassId.get(item._id.toString()) || 0,
                    nextExam: nextExam
                        ? {
                            title: nextExam.title,
                            startTime: nextExam.startTime,
                            durationMinutes: nextExam.durationMinutes
                        }
                        : null
                };
            })
        });
    } catch (error) {
        console.error("Failed to retrieve teacher classes:", error);
        return res.status(500).json({ error: "Failed to retrieve your classes." });
    }
};

export const getTeacherClassDetails = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const classId = req.params.classId;
        if (typeof classId !== "string" || !mongoose.Types.ObjectId.isValid(classId)) {
            return res.status(400).json({ error: "Invalid class ID." });
        }

        const teacherId = (req as any).user.userId;
        const classItem = await classModel.findOne({ _id: classId, teacherId }).lean();
        if (!classItem) {
            return res.status(404).json({ error: "Class not found." });
        }

        const [memberships, exams] = await Promise.all([
            classMemberModel.find({ classId })
                .populate("studentId", "fullName email")
                .sort({ joinedAt: -1 })
                .lean(),
            examModel.find({ classId, teacherId })
                .select("title status startTime durationMinutes")
                .sort({ startTime: -1 })
                .lean()
        ]);

        return res.status(200).json({
            class: {
                id: classItem._id,
                name: classItem.name,
                description: classItem.description || "",
                code: classItem.classCode,
                active: classItem.isActive,
                students: memberships.map((membership: any) => ({
                    id: membership.studentId?._id,
                    name: membership.studentId?.fullName || "Unknown student",
                    email: membership.studentId?.email || "",
                    joinedAt: membership.joinedAt
                })),
                exams: exams.map((exam) => ({
                    id: exam._id,
                    title: exam.title,
                    status: exam.status,
                    startTime: exam.startTime,
                    durationMinutes: exam.durationMinutes
                }))
            }
        });
    } catch (error) {
        console.error("Failed to retrieve teacher class details:", error);
        return res.status(500).json({ error: "Failed to retrieve class details." });
    }
};

export const getStudentClasses = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const studentId = (req as any).user.userId;
        const memberships = await classMemberModel.find({ studentId }).sort({ joinedAt: -1 });
        const classIds = memberships.map((membership) => membership.classId);
        const classes = await classModel
            .find({ _id: { $in: classIds }, isActive: true })
            .populate("teacherId", "fullName email");
        const joinedAtByClassId = new Map(
            memberships.map((membership) => [
                membership.classId.toString(),
                membership.joinedAt
            ])
        );

        return res.status(200).json({
            classes: classes.map((item: any) => ({
                id: item._id,
                name: item.name,
                description: item.description || "",
                classCode: item.classCode,
                teacher: item.teacherId
                    ? {
                        id: item.teacherId._id,
                        name: item.teacherId.fullName,
                        email: item.teacherId.email
                    }
                    : null,
                joinedAt: joinedAtByClassId.get(item._id.toString()) || item.createdAt
            }))
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to retrieve your classes." });
    }
};

export const findClassByCode = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const classCode = typeof req.body.classCode === "string"
            ? req.body.classCode.trim().toUpperCase()
            : "";

        if (!classCode) {
            return res.status(400).json({ error: "Class code is required." });
        }

        const classItem = await classModel
            .findOne({ classCode, isActive: true })
            .populate("teacherId", "fullName email");

        if (!classItem) {
            return res.status(404).json({ error: "Class not found or inactive." });
        }

        const studentId = (req as any).user.userId;
        const membership = await classMemberModel.findOne({
            classId: classItem._id,
            studentId
        });

        return res.status(200).json({
            class: {
                id: classItem._id,
                name: classItem.name,
                description: classItem.description || "",
                classCode: classItem.classCode,
                alreadyJoined: Boolean(membership),
                teacher: classItem.teacherId
                    ? {
                        id: (classItem.teacherId as any)._id,
                        name: (classItem.teacherId as any).fullName,
                        email: (classItem.teacherId as any).email
                    }
                    : null
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to find the class." });
    }
};

export const createClass = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                error: "Class name is required"
            });
        }

        const teacherId = (req as any).user.userId;

        let classCode = "";
        let existingClass;

        do {
            classCode = crypto
                .randomBytes(4)
                .toString("hex")
                .toUpperCase()
                .slice(0, 8);

            existingClass = await classModel.findOne({ classCode });

        } while (existingClass);


        const newClass = await classModel.create({
            name,
            description,
            classCode,
            teacherId
        });

        return res.status(201).json({
            message: "Class created successfully",
            class: newClass
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            error: "Failed to create class"
        });
    }
};


export const joinClass = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { classCode } = req.body;

        if (!classCode) {
            return res.status(400).json({
                error: "Class code is required"
            });
        }

        const studentId = (req as any).user.userId;


        const existingClass = await classModel.findOne({
            classCode: classCode.trim().toUpperCase(),
            isActive: true
        });

        if (!existingClass) {
            return res.status(404).json({
                error: "Class not found or inactive"
            });
        }

        const membership = await classMemberModel.findOne({
            classId: existingClass._id,
            studentId
        });

        if (membership) {
            return res.status(409).json({
                error: "You have already joined this class"
            });
        }

        const newMembership = await classMemberModel.create({
            classId: existingClass._id,
            studentId
        });

        return res.status(201).json({
            message: "You joined the class successfully",
            membership: newMembership,
            class: {
                id: existingClass._id,
                name: existingClass.name,
                classCode: existingClass.classCode
            }
        });

    } catch (error: any) {

        if (error.code === 11000) {
            return res.status(409).json({
                error: "You have already joined this class"
            });
        }

        console.log(error);

        return res.status(500).json({
            error: "Failed to join class"
        });
    }
};