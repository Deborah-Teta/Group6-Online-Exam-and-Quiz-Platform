import express from "express";
import { classModel } from "../models/ClassSchema.js";
import crypto from "crypto";

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
