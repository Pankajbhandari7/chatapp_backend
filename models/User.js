import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: false },
    username: { type: String, required: false, unique: true, sparse: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isOnline: { type: Boolean, default: false }
},
{timestamps: true}
);

const User = mongoose.model("User", userSchema);
export default User;