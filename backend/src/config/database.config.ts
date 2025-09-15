import mongoose from "mongoose";
import { Env } from "./env.config";

export const connectDatabase = async() => {
    try{
        await mongoose.connect(Env.MONGODB_URL)
        console.log("MongoDB Connected")
    }
    catch(e){
        console.log("Error : ",e)
    }
}

