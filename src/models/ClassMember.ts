import mongoose,{Schema,Document} from "mongoose"

export interface IClassMember extends Document{
    classId: mongoose.Types.ObjectId,
    studentId: mongoose.Types.ObjectId;
    joinedAt: Date;
}

const classMemberSchema = new Schema<IClassMember>({
    classId:{type:mongoose.Types.ObjectId,ref:"Class",required:true,index:true},
    studentId:{type:mongoose.Types.ObjectId,ref:"User",required:true,index:true},
    joinedAt:{type:Date,default:Date.now},
})

classMemberSchema.index(
    { classId: 1, studentId: 1 },
    { unique: true }
);

export const classMemberModel = mongoose.model<IClassMember>("ClassMember", classMemberSchema);