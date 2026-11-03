import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()
export const dbConnection =async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL as string)
        console.log("MongoDB connected successfully");
    }catch(e){
        console.error("MongoDB connection failed:", e);
    }
}

