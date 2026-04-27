import express from "express";
import { registerUser, loginUser, resetPassword, getAllUsers, findUserByPhoneNumber } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);
router.get("/all", getAllUsers);
router.get("/by-phone/:phoneNumber", findUserByPhoneNumber);

export default router;
