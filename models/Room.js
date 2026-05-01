import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    isGroup: { type: Boolean, default: true },
    members: [{ type: String }], // Array of usernames
},
    { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);
export default Room;
