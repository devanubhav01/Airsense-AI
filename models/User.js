import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, sparse: true }, // required hata diya, sparse taaki multiple null allow ho
        phone: { type: String, unique: true, sparse: true },
        age: { type: Number },
        state: { type: String },
        city: { type: String },
        authProvider: { type: String, enum: ["google", "github", "phone", "email"], default: "email" },
    },
    { timestamps: true }
);

export default models.User || model("User", UserSchema);