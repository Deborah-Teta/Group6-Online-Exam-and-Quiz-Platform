import express from "express";
import { aiDraftModel } from "../models/AiDraftSchema.js";
import { classMemberModel } from "../models/ClassMember.js";
import { classModel } from "../models/ClassSchema.js";
import { examModel } from "../models/ExamSchema.js";
import { questionModel } from "../models/QuestionsSchema.js";

export const getTeacherDashboard = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const teacherId = (req as any).user.userId;
        const now = new Date();
        const todayStart = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate()
        ));
        const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const classes = await classModel
            .find({ teacherId, isActive: true })
            .select("_id name description classCode isActive")
            .sort({ createdAt: -1 })
            .lean();
        const classIds = classes.map((item) => item._id);

        const [
            membershipsByClass,
            questionCount,
            aiQuestionCount,
            pendingDraftCount,
            examsNextSevenDays,
            examsToday,
            upcomingExams
        ] = await Promise.all([
            classIds.length
                ? classMemberModel.aggregate([
                    { $match: { classId: { $in: classIds } } },
                    { $group: { _id: "$classId", count: { $sum: 1 } } }
                ])
                : Promise.resolve([]),
            questionModel.countDocuments({ teacherId }),
            questionModel.countDocuments({ teacherId, source: "ai" }),
            aiDraftModel.countDocuments({ teacherId, reviewStatus: "pending" }),
            examModel.countDocuments({
                teacherId,
                classId: { $in: classIds },
                status: { $in: ["scheduled", "published"] },
                startTime: { $gte: now, $lt: nextWeek }
            }),
            examModel.countDocuments({
                teacherId,
                classId: { $in: classIds },
                status: { $in: ["scheduled", "published"] },
                startTime: { $gte: todayStart, $lt: tomorrowStart }
            }),
            examModel
                .find({
                    teacherId,
                    classId: { $in: classIds },
                    status: { $in: ["scheduled", "published"] },
                    startTime: { $gte: now }
                })
                .populate("classId", "name")
                .populate("questionIds", "points")
                .sort({ startTime: 1 })
                .limit(5)
                .lean()
        ]);

        const studentCountByClassId = new Map(
            membershipsByClass.map((item: { _id: { toString(): string }; count: number }) => [
                item._id.toString(),
                item.count
            ])
        );

        return res.status(200).json({
            stats: {
                classCount: classes.length,
                studentCount: membershipsByClass.reduce(
                    (total: number, item: { count: number }) => total + item.count,
                    0
                ),
                questionCount,
                aiQuestionCount,
                examsNextSevenDays,
                examsToday,
                pendingDraftCount
            },
            classes: classes.map((item) => ({
                id: item._id,
                name: item.name,
                description: item.description || "",
                code: item.classCode,
                active: item.isActive,
                students: studentCountByClassId.get(item._id.toString()) || 0
            })),
            upcomingExams: upcomingExams.map((exam: any) => ({
                id: exam._id,
                title: exam.title,
                className: exam.classId?.name || "Class",
                startTime: exam.startTime,
                durationMinutes: exam.durationMinutes,
                questionCount: exam.questionIds.length,
                totalPoints: exam.questionIds.reduce(
                    (total: number, question: { points?: number }) =>
                        total + (question.points || 0),
                    0
                )
            }))
        });
    } catch (error) {
        console.error("Failed to retrieve teacher dashboard data:", error);
        return res.status(500).json({
            error: "Failed to retrieve teacher dashboard data."
        });
    }
};
