import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "d:/AppWizards/chat-application/backend/.env" });

const check = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected");
    const dbs = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", dbs.map(d => d.name).join(", "));
    process.exit(0);
};

check();
