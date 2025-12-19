import mongoose, { Document, Schema } from 'mongoose';
import bcryptjs from 'bcryptjs';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    password: string;
    avatar?: string;
    bio?: string;
    isActive: boolean;
    role: 'user' | 'admin' | 'guest';
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [30, "Username must be at most 30 characters long"],
    },
    email: {
        type: String,
        required: [true, "Emial is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],

    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
    },
    avatar: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: null,
        maxlength: [160, "Bio must be at most 160 characters long"],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'visitor'],
        default: 'user',
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcryptjs.genSalt(12);
        this.password = await bcryptjs.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return bcryptjs.compare(candidatePassword, this.password);
};

export const UserModel = mongoose.model<IUser>('User', userSchema);

