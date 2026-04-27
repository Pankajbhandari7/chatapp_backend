import Message from "../models/Message.js";

// Fetch chat history between two users
export const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get unread counts for a user
export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Count all messages where the user is the receiver and isRead is false
    const count = await Message.countDocuments({
      receiverId: userId,
      isRead: false
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body; // receiverId is the one who read the messages
    
    await Message.updateMany(
      { senderId, receiverId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
