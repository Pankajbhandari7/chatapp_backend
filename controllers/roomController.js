import Room from "../models/Room.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const attachMemberDetails = async (roomDoc) => {
  const room = roomDoc.toObject ? roomDoc.toObject() : roomDoc;
  const memberPhones = (room.members || []).filter(Boolean);
  const users = await User.find(
    { phoneNumber: { $in: memberPhones } },
    "name phoneNumber"
  );

  const memberDetails = memberPhones.map((phone) => {
    const matched = users.find((u) => u.phoneNumber === phone);
    return {
      phoneNumber: phone,
      name: matched?.name || "Unknown User",
    };
  });

  return {
    ...room,
    memberDetails,
    memberCount: memberDetails.length,
  };
};

// Create a new group
export const createRoom = async (req, res) => {
  try {
    const { name, members } = req.body;
    const room = new Room({ name, members, isGroup: true });
    await room.save();
    const roomWithMembers = await attachMemberDetails(room);
    res.status(201).json(roomWithMembers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all rooms a user belongs to
export const getUserRooms = async (req, res) => {
  try {
    const { username } = req.params;
    const rooms = await Room.find({ members: username }).sort({ updatedAt: -1 });
    const roomsWithMembers = await Promise.all(rooms.map((room) => attachMemberDetails(room)));
    res.status(200).json(roomsWithMembers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get messages for a specific room
export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a member by phone number
export const addMember = async (req, res) => {
  try {
    const { roomId, phoneNumber } = req.body;

    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ message: "No registered user found with that phone number" });

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Use phoneNumber as the identifier since it's the unique key now
    if (!room.members.includes(user.phoneNumber)) {
      room.members.push(user.phoneNumber);
      await room.save();
    }

    const updatedRoom = await attachMemberDetails(room);
    res.status(200).json({ message: "User added successfully", user, room: updatedRoom });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });
    const roomWithMembers = await attachMemberDetails(room);
    res.status(200).json(roomWithMembers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
