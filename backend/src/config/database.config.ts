import mongoose from "mongoose";
import { Env } from "./env.config";

export const connectDatabase = async() => {
    try{
        if (!Env.MONGODB_URL) {
            throw new Error("MONGODB_URL is not defined in environment variables");
        }

        // Connection options for better reliability
        const connectionOptions = {
            serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        };

        // Disable mongoose buffering globally
        mongoose.set('bufferCommands', false);

        await mongoose.connect(Env.MONGODB_URL, connectionOptions);
        console.log("✅ MongoDB Connected successfully");
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });
    }
    catch(e){
        console.error("❌ MongoDB connection failed:", e);
        throw e; // Re-throw to prevent server from starting without DB
    }
}

