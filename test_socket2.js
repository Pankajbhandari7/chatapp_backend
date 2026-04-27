import { io } from "socket.io-client";
import axios from "axios";

const run = async () => {
    try {
        // Register User A
        await axios.post("http://localhost:5000/api/users/register", { phoneNumber: "111", name: "User A", password: "password" }).catch(()=>null);
        // Register User B
        await axios.post("http://localhost:5000/api/users/register", { phoneNumber: "222", name: "User B", password: "password" }).catch(()=>null);

        const socketA = io("http://localhost:5000");
        const socketB = io("http://localhost:5000");

        socketA.emit("join", { userId: "111", roomIds: [] });
        socketB.emit("join", { userId: "222", roomIds: [] });

        socketB.on("added_to_group", (room) => {
            console.log("User B added to group:", room.name);
            process.exit(0);
        });

        // User A creates a group
        const res = await axios.post("http://localhost:5000/api/rooms/create", { name: "Test Group", members: ["111"] });
        const room = res.data;
        console.log("User A created group:", room.name);
        socketA.emit("join_room", room._id);

        // User A adds User B
        const addRes = await axios.post("http://localhost:5000/api/rooms/add-member", { roomId: room._id, phoneNumber: "222" });
        console.log("User A added User B to group");
        const updatedRoom = addRes.data.room;

        // Simulate User A emitting group_updated
        socketA.emit("group_updated", { room: updatedRoom, addedUserId: "222" });

        setTimeout(() => {
            console.log("Timeout waiting for added_to_group event");
            process.exit(1);
        }, 3000);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
