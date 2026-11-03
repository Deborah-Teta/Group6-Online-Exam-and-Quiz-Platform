import express from "express";
import { classModel } from "../models/ClassSchema.js";
import crypto from "crypto";
import {classMemberModel} from "../models/ClassMember.js";


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