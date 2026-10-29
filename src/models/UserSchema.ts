import mongoose, {Document, Schema} from "mongoose";
export interface IUser extends Document{
    fullName: string,
    email: string,
    password: string,
    role:"Admin" | "Student" | "Teacher",
    resetCode?: string;
    resetCodeExpires?: Date;
}

const userSchema = new Schema({
    fullName:{type:String,required:true},
},{timestamps:true})