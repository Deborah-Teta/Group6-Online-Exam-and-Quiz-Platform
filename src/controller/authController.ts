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
        
        const user = await userModel.findOne({email})
        if(user){
            return res.status(400).json({error: 'Email already exists'})
        }


        const hashedPassword = await bcrypt.hash(password,10)
        await userModel.create({
            fullName,email,password:hashedPassword
        })

        return res.status(201).json({
            message: "User created",
            user: { fullName, email }
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

        const user = await userModel.findOne({email})
        if(!user){
            return res.status(400).json({error: 'no user with this email or password'});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({error: 'no user with this email or password'});
        }


        const token = jwt.sign(
            {userId:user._id,role:user.role,name:user.fullName},
            process.env.JWT_SECRET as string,
            {expiresIn:"1d"})

        return  res.status(200).json({message:"Login successful",token:token});
    }catch(e){
        console.log(e)
        return res.status(500).send({message:"Something went wrong",e})
    }
}