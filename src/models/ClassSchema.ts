import mongoose,{Schema,Document} from "mongoose"

export interface IClass extends Document{
    name: string,
    description?: string,
    classCode:string,
    teacherId:mongoose.Types.ObjectId,
    isActive:boolean
}

const classSchema = new Schema<IClass>({
    name:{type:String,required:true,trim:true,index:true},
    description:{type:String,trim:true},
    classCode:{type:String,required:true,trim:true,uppercase:true,unique:true},
    teacherId:{type:mongoose.Types.ObjectId,ref:"User",required:true,index:true},
    isActive:{type:Boolean,default:true},
},{timestamps:true})

export const classModel = mongoose.model<IClass>("Class", classSchema);