import express from "express"
import {userModel} from "../models/UserSchema.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"



export const registerUser = async (req: express.Request, res: express.Response) => {
    try{
        const {fullName, email, password,role} = req.body
        if(!fullName || !email || !password){
            return res.status(400).json({error: "Names,Email and Password are all required"})
        }

        const allowedRoles = ["student","teacher"]
        if (role && !allowedRoles.includes(role)) {
            return res.status(400).json({
                error: "Invalid role"
            });
        }

        const userRole = role || "student";
        const user = await userModel.findOne({email})
        if(user){
            return res.status(400).json({error: 'Email already exists'})
        }


        const hashedPassword = await bcrypt.hash(password,10)
        await userModel.create({
            fullName,email,password:hashedPassword,role:userRole,approvalStatus: userRole === "teacher" ? "pending" : "approved"
        })

        return res.status(201).json({
            message: "User created",
            user: { fullName, email,role }
        });
    }catch(e){
        console.log(e)
        return res.status(500).send({message:"Something went wrong",e})
    }
}

export const loginUser = async (req: express.Request, res: express.Response) => {
    try{
        const {email, password} = req.body
        if(!email || !password){
            return res.status(400).json({error: "Email and Password are all required"})
        }

        const user = await userModel.findOne({email}).select("+password")
        if(!user){
            return res.status(401).json({error: 'no user with this email or password'});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(401).json({error: 'no user with this email or password'});
        }

        if(user.isBlocked){
            return res.status(403).json({error: "Your account has been blocked. Contact the administrator."});
        }

        if (user.role === "teacher" && user.approvalStatus === "pending") {
            return res.status(403).json({error: "Your account is waiting for admin approval."});
        }

        if (user.role === "teacher" && user.approvalStatus === "rejected") {
            return res.status(403).json({error: "Your teacher registration was rejected."});
        }

        const token = jwt.sign(
            {userId:user._id,role:user.role,name:user.fullName},
            process.env.JWT_SECRET as string,
            {expiresIn:"1d"})

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id.toString(),
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    }catch(e){
        console.log(e)
        return res.status(500).send({message:"Something went wrong",e})
    }
}

export const updateStudentProfile = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const fullName = typeof req.body.fullName === "string"
            ? req.body.fullName.trim()
            : "";
        if (fullName.length < 2 || fullName.length > 100) {
            return res.status(400).json({
                error: "Name must be between 2 and 100 characters."
            });
        }

        const studentId = (req as any).user.userId;
        const user = await userModel.findOneAndUpdate(
            { _id: studentId, role: "student" },
            { fullName },
            { new: true, runValidators: true }
        ).select("fullName email role");

        if (!user) {
            return res.status(404).json({ error: "Student account not found." });
        }

        return res.status(200).json({
            message: "Profile updated successfully.",
            user: {
                id: user._id.toString(),
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to update your profile." });
    }
};

export const changeStudentPassword = async (
    req: express.Request,
    res: express.Response
) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
            return res.status(400).json({ error: "Current and new passwords are required." });
        }
        if (newPassword.length < 8 || !/\d/.test(newPassword)) {
            return res.status(400).json({
                error: "Use at least 8 characters and include at least one number."
            });
        }

        const studentId = (req as any).user.userId;
        const user = await userModel.findOne({ _id: studentId, role: "student" }).select("+password");
        if (!user) {
            return res.status(404).json({ error: "Student account not found." });
        }

        const passwordMatches = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatches) {
            return res.status(400).json({ error: "Your current password is incorrect." });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        return res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to update your password." });
    }
};
