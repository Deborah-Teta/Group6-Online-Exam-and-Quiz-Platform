import mongoose, {Document, Schema} from "mongoose";
export interface IUser extends Document{
    fullName: string,
    email: string,
    password: string,
    role:"admin" | "student" | "teacher",
    resetCode?: string;
    resetCodeExpires?: Date;
    approvalStatus: "pending" | "approved" | "rejected";
    isBlocked: boolean;
    blockedReason?: string;
}

const userSchema = new Schema<IUser>({
    fullName:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true,select:false},
    role:{type:String,required:true,enum:["admin" ,"student" ,"teacher"],default:"student"},
    resetCode:{type:String},
    resetCodeExpires:{type:Date},
    approvalStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: function () {
            return this.role === "teacher" ? "pending" : "approved";
        },
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    
},{timestamps:true})

export const userModel = mongoose.model<IUser>("User", userSchema);