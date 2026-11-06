import express from "express";
import { classModel } from "../models/ClassSchema.js";
import crypto from "crypto";
import {classMemberModel} from "../models/ClassMember.js";
import { examModel } from "../models/ExamSchema.js";


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

export const getStudentClasses = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const studentId = (req as any).user.userId;
        const memberships = await classMemberModel
            .find({ studentId })
            .sort({ joinedAt: -1 });

        const classIds = memberships.map(m => m.classId);
        const classes = await classModel
            .find({ _id: { $in: classIds }, isActive: true })
            .populate("teacherId", "fullName email");

        const result = memberships.map(m => {
            const cls = classes.find(c => c._id.toString() === m.classId.toString());
            if (!cls) return null;
            const teacher = cls.teacherId as any;
            return {
                id: cls._id,
                name: cls.name,
                description: cls.description || "",
                classCode: cls.classCode,
                teacher: {
                    name: teacher?.fullName || "Teacher",
                    email: teacher?.email || ""
                },
                joinedAt: m.joinedAt
            };
        }).filter(Boolean);

        return res.status(200).json({ classes: result });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to retrieve classes" });
    }
};

export const lookupClass = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { classCode } = req.body;
        if (!classCode) {
            return res.status(400).json({ error: "Class code is required" });
        }
        const studentId = (req as any).user.userId;
        const foundClass = await classModel.findOne({
            classCode: classCode.trim().toUpperCase(),
            isActive: true
        }).populate("teacherId", "fullName email");

        if (!foundClass) {
            return res.status(404).json({ error: "Class not found with that code" });
        }

        const existingMembership = await classMemberModel.findOne({
            classId: foundClass._id,
            studentId
        });

        const teacher = foundClass.teacherId as any;

        return res.status(200).json({
            class: {
                id: foundClass._id,
                name: foundClass.name,
                description: foundClass.description || "",
                classCode: foundClass.classCode,
                teacher: {
                    name: teacher?.fullName || "Teacher",
                    email: teacher?.email || ""
                },
                alreadyJoined: Boolean(existingMembership)
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to lookup class" });
    }
};

export const getTeacherClasses = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const teacherId = (req as any).user.userId;
        const classes = await classModel
            .find({ teacherId, isActive: true })
            .sort({ createdAt: -1 });

        const classIds = classes.map(c => c._id);
        const members = await classMemberModel.find({ classId: { $in: classIds } });

        const now = new Date();
        const exams = await examModel.find({
            classId: { $in: classIds },
            startTime: { $gte: now },
            status: { $in: ["scheduled", "published"] }
        }).sort({ startTime: 1 });

        const result = classes.map(cls => {
            const studentCount = members.filter(
                m => m.classId.toString() === cls._id.toString()
            ).length;
            const nextExam = exams.find(
                e => e.classId.toString() === cls._id.toString()
            );

            return {
                id: cls._id,
                name: cls.name,
                description: cls.description || "",
                classCode: cls.classCode,
                students: studentCount,
                active: cls.isActive,
                nextExam: nextExam
                    ? {
                        title: nextExam.title,
                        startTime: nextExam.startTime
                    }
                    : null
            };
        });

        return res.status(200).json({ classes: result });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to retrieve teacher classes" });
    }
};

export const getTeacherClassDetails = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const teacherId = (req as any).user.userId;
        const { classId } = req.params;

        if (typeof classId !== "string") {
            return res.status(400).json({ error: "Invalid class ID" });
        }

        const cls = await classModel.findOne({ _id: classId, teacherId });
        if (!cls) {
            return res.status(404).json({ error: "Class not found" });
        }

        const members = await classMemberModel
            .find({ classId })
            .populate("studentId", "fullName email");
        const exams = await examModel
            .find({ classId })
            .sort({ startTime: -1 });

        return res.status(200).json({
            class: {
                id: cls._id,
                name: cls.name,
                description: cls.description || "",
                classCode: cls.classCode,
                active: cls.isActive,
                students: members.map(m => {
                    const student = m.studentId as any;
                    return {
                        id: student?._id,
                        fullName: student?.fullName || "Student",
                        email: student?.email || "",
                        joinedAt: m.joinedAt
                    };
                }),
                exams: exams.map(e => ({
                    id: e._id,
                    title: e.title,
                    startTime: e.startTime,
                    durationMinutes: e.durationMinutes,
                    status: e.status
                }))
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to retrieve class details" });
    }
};