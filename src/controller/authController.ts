import express from "express"
import {userModel} from "../models/UserSchema.js";
import bcrypt from "bcrypt"



export const registerUser = async (req: express.Request, res: express.Response) => {
    try{
        const {fullName, email, password} = req.body
        if(!fullName || !email || !password){
            return res.status(400).json({error: "Names,Email and Password are all required"})
        }
        const user = await userModel.findOne({email})
        if(user){
            return res.status(400).json({error: "no user with this email or password"})
        }

        const isPasswordCorrect = await bcrypt.compare(password,user.password)
        if(!isPasswordCorrect){
            return res.status(400).json({error: "Password incorrect or password"})
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
        res.status(500).send({message:"Something went wrong"})
    }
}