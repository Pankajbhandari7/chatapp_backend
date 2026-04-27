import User from "../models/User.js";
import bcrypt from "bcryptjs";

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  username: user.username,
  phoneNumber: user.phoneNumber,
  isOnline: user.isOnline,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const registerUser = async (req, res) => {
  try {
    const { phoneNumber, name, password } = req.body;
    if (!phoneNumber || !name || !password) {
      return res.status(400).json({ message: "Name, phone number and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(409).json({ message: "Phone number already registered. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      username: phoneNumber,
      phoneNumber,
      password: hashedPassword,
    });

    res.status(201).json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
      return res.status(400).json({ message: "Phone number and password are required" });
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.password) {
      return res.status(400).json({ message: "Account has no password. Please reset your password first." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || "");
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.status(200).json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { phoneNumber, name, newPassword } = req.body;
    if (!phoneNumber || !name || !newPassword) {
      return res.status(400).json({ message: "Phone number, name and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ message: "User not found" });
    if ((user.name || "").trim().toLowerCase() !== name.trim().toLowerCase()) {
      return res.status(401).json({ message: "Name does not match this phone number" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(
      { phoneNumber: { $exists: true, $ne: null, $ne: "" } },
      "-password -otp -otpExpires"
    );
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const findUserByPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const user = await User.findOne({
      phoneNumber,
      $and: [{ phoneNumber: { $exists: true } }, { phoneNumber: { $ne: null } }, { phoneNumber: { $ne: "" } }],
    }).select("-password -otp -otpExpires");

    if (!user) {
      return res.status(404).json({ message: "This phone number is not registered" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
