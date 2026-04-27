import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "d:/AppWizards/chat-application/backend/.env" });

const check = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected");
    const msgs = await mongoose.connection.collection("messages").find({}).toArray();
    console.log("Messages: " + msgs.length);
    console.log(msgs.length > 0 ? msgs[msgs.length-1] : "No messages");
    process.exit(0);
};

check();
