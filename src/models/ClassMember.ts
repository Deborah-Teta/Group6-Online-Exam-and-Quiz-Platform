import mongoose,{Schema,Document} from "mongoose"

export interface IClassMember extends Document{
    classId: mongoose.Types.ObjectId,
    studentId: mongoose.Types.ObjectId;
    joinedAt: Date;
}

const classMemberSchema = new Schema<IClassMember>({
    classId:{type:mongoose.Types.ObjectId,ref:"Class",required:true},
    studentId:{type:mongoose.Types.ObjectId,ref:"User",required:true},
})