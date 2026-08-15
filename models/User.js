import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        age: { type: Number },
        state: { type: String },
        city: { type: String },
        authProvider: { type: String, enum: ["google", "github", "phone", "email"], default: "email" },
    },
    { timestamps: true }
);

export default models.User || model("User", UserSchema);