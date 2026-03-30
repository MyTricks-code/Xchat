import messageModel from "../models/messages.model.js";

const userMessageCounts = new Map(); // userId -> timestamp[]

export const handleSendMessage = async (io, socket, data) => {
  const { sender, roomId } = data;

  if (!sender) {
    socket.emit("toastError", "Authentication required to send messages.");
    return;
  }

  // Rate limiting: 20 messages per minute
  const now = Date.now();
  const windowMs = 60 * 1000;
  let userHistory = userMessageCounts.get(sender) || [];

  // Filter out timestamps outside the sliding window
  userHistory = userHistory.filter((t) => now - t < windowMs);

  if (userHistory.length >= 20) {
    socket.emit("toastError", "Rate limit exceeded. Max 20 messages per minute.");
    return;
  }

  // Record current message timestamp
  userHistory.push(now);
  userMessageCounts.set(sender, userHistory);

  try {
    let message = await messageModel.create(data);
    message = await message.populate("sender", "username");

    io.to(roomId).emit("newMessage", message);
  } catch (err) {
    console.error("Error in handleSendMessage:", err);
    socket.emit("toastError", "Failed to send message. Please try again.");
  }
};