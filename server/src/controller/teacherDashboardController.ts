import express from "express";
import { classModel } from "../models/ClassSchema.js";
import { classMemberModel } from "../models/ClassMember.js";
import { questionModel } from "../models/QuestionsSchema.js";
import { examModel } from "../models/ExamSchema.js";
import { aiDraftModel } from "../models/AiDraftSchema.js";

export const getTeacherDashboard = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const teacherId = (req as any).user.userId;

        const classes = await classModel.find({ teacherId, isActive: true }).sort({ createdAt: -1 });
        const classIds = classes.map(c => c._id);

        const members = await classMemberModel.find({ classId: { $in: classIds } });
        const uniqueStudentIds = new Set(members.map(m => m.studentId.toString()));

        const [
            questionCount,
            aiQuestionCount,
            pendingDraftCount
        ] = await Promise.all([
            questionModel.countDocuments({ teacherId }),
            questionModel.countDocuments({ teacherId, source: "ai" }),
            aiDraftModel.countDocuments({ teacherId, reviewStatus: "pending" })
        ]);

        const now = new Date();
        const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
        const inSevenDays = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

        const [examsToday, examsNextSevenDays, upcomingExamsRaw] = await Promise.all([
            examModel.countDocuments({
                teacherId,
                startTime: { $gte: startOfToday, $lt: endOfToday }
            }),
            examModel.countDocuments({
                teacherId,
                startTime: { $gte: now, $lt: inSevenDays }
            }),
            examModel.find({
                teacherId,
                startTime: { $gte: now }
            })
                .populate("classId", "name")
                .populate("questionIds", "points")
                .sort({ startTime: 1 })
                .limit(5)
        ]);

        const upcomingExams = upcomingExamsRaw.map(exam => {
            const cls = exam.classId as any;
            const questions = (exam.questionIds as any[]) || [];
            const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
            return {
                id: exam._id,
                title: exam.title,
                className: cls?.name || "Class",
                startTime: exam.startTime,
                durationMinutes: exam.durationMinutes,
                questionCount: questions.length,
                totalPoints
            };
        });

        const mappedClasses = classes.map(cls => ({
            id: cls._id,
            name: cls.name,
            code: cls.classCode,
            students: members.filter(m => m.classId.toString() === cls._id.toString()).length
        }));

        return res.status(200).json({
            stats: {
                classCount: classes.length,
                studentCount: uniqueStudentIds.size,
                questionCount,
                aiQuestionCount,
                examsNextSevenDays,
                examsToday,
                pendingDraftCount
            },
            upcomingExams,
            classes: mappedClasses
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to retrieve teacher dashboard" });
    }
};

