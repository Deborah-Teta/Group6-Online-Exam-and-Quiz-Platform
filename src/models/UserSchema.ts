import mongoose, {Document, Schema} from "mongoose";
export interface IUser extends Document{
    fullName: string,
    email: string,
    password: string,
    role:"Admin" | "Student" | "Teacher",
    resetCode?: string;
    resetCodeExpires?: Date;
}

const userSchema = new Schema<IUser>({
    fullName:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
},{timestamps:true})