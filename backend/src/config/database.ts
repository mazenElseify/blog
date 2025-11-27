import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
    try {

        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog';
        await mongoose.connect(mongoURI);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed: ", error);
        throw error;

    }
};

export const disconnectDatabase = async (): Promise<void> => {
    try{ 
        await mongoose.disconnect();
        console.log("Database disconnected successfully");
    } catch (error) {
        console.error("Database disconnection failed: " , error);
        throw error;
    }
};


    