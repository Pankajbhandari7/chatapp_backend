import { io } from "socket.io-client";
import axios from "axios";

const run = async () => {
    try {
        const socketA = io("http://localhost:5000");
        const socketB = io("http://localhost:5000");
        const socketC = io("http://localhost:5000");

        socketA.emit("join", { userId: "111", roomIds: [] });
        socketB.emit("join", { userId: "222", roomIds: [] });
        socketC.emit("join", { userId: "333", roomIds: [] });

        await new Promise(resolve => setTimeout(resolve, 1000));

        socketB.on("added_to_group", (room) => {
            console.log("User B received added_to_group event:", room.name);
        });

        // Test room update for C
        socketC.on("room_updated", (room) => {
            console.log("User C received room_updated event:", room.name);
            process.exit(0);
        });

        // User A creates a group
        const res = await axios.post("http://localhost:5000/api/rooms/create", { name: "Test Group 3", members: ["111", "333"] });
        const room = res.data;
        console.log("User A created group:", room.name);
        socketA.emit("join_room", room._id);
        socketC.emit("join_room", room._id);

        await new Promise(resolve => setTimeout(resolve, 500));

        // User A adds User B
        const addRes = await axios.post("http://localhost:5000/api/rooms/add-member", { roomId: room._id, phoneNumber: "222" });
        console.log("User A added User B to group");
        const updatedRoom = addRes.data.room;

        // Simulate User A emitting group_updated
        socketA.emit("group_updated", { room: updatedRoom, addedUserId: "222" });

        setTimeout(() => {
            console.log("Timeout waiting for events");
            process.exit(1);
        }, 3000);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
