import mongoose,{Schema,Document} from "mongoose"

export interface IClass extends Document{
    name: string,
    description?: string,
    classCode:string,
    teacherId:mongoose.Types.ObjectId,
    isActive:boolean
}

const classSchema = new Schema<IClass>({
    name:{type:String,required:true,trim:true},
    description:{type:String,required:true,trim:true},
    classCode:{type:String,required:true,trim:true,uppercase:true,unique:true},
})