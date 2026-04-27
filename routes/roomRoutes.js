import express from "express";
import { createRoom, getUserRooms, getRoomMessages, addMember, getRoomDetails } from "../controllers/roomController.js";

const router = express.Router();

router.post("/create", createRoom);
router.post("/add-member", addMember);
router.get("/messages/:roomId", getRoomMessages);
router.get("/details/:roomId", getRoomDetails);
router.get("/:username", getUserRooms);

export default router;
