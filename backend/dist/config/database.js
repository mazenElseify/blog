"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDatabase = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog';
        await mongoose_1.default.connect(mongoURI);
        console.log("Database connected successfully");
    }
    catch (error) {
        console.error("Database connection failed: ", error);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    try {
        await mongoose_1.default.disconnect();
        console.log("Database disconnected successfully");
    }
    catch (error) {
        console.error("Database disconnection failed: ", error);
        throw error;
    }
};
exports.disconnectDatabase = disconnectDatabase;
