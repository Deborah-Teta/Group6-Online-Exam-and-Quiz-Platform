import mongoose,{Schema,Document} from "mongoose"

export interface IClassMember extends Document{
    classId: mongoose.Types.ObjectId,
    studentId: mongoose.Types.ObjectId;
    joinedAt: Date;
}