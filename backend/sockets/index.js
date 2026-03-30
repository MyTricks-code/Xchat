import { handleSendMessage } from "./handleMessage.js";
import { handleJoinRoom } from "./roomHandler.js";


const userSessionMap = new Map(); // socket.id -> { userId, roomId, username }
const pendingDisconnects = new Map(); // userId -> { timeoutId, roomId, username }

const broadcastParticipants = (io, roomId) => {
  // Get all unique active usernames for the specified room
  const participants = Array.from(userSessionMap.values())
    .filter((u) => u.roomId === roomId)
    .map((u) => u.username)
    .filter((v, i, a) => a.indexOf(v) === i && v); // Unique and truthy

  io.to(roomId).emit("participants", participants);
};
export const registerSockets = (io) => {
  io.on("connection", (socket) => {

    socket.on("joinRoom", (data) => {
      const { userId, roomId, username } = data;
      console.log(`User ${username} (${userId}) joining room ${roomId}`);
      
      if (userId && pendingDisconnects.has(userId)) {
        console.log(`Clearing pending disconnect for ${username}`);
        const pending = pendingDisconnects.get(userId);
        clearTimeout(pending.timeoutId);
        pendingDisconnects.delete(userId);
        handleJoinRoom(io, socket, data, false);
      } else {
        handleJoinRoom(io, socket, data, true);
      }
      
      if (userId) {
        userSessionMap.set(socket.id, { userId, roomId, username });
      }

      // Broadcast updated participants list
      broadcastParticipants(io, roomId);
    });

    socket.on("sendMessage", (data) => {
      handleSendMessage(io, socket, data);
    });

    socket.on("disconnect", () => {
      // Find the user data associated with this socket
      const userData = userSessionMap.get(socket.id);
      if (userData) {
        const { userId, roomId, username } = userData;
        // Remove this specific socket from tracking
        userSessionMap.delete(socket.id);
        
        // Check if the user still has other active sockets in this room
        const remains = Array.from(userSessionMap.values()).some(
          u => u.userId === userId && u.roomId === roomId
        );
        
        if (remains) {
          console.log(`User ${username} still present via another tab.`);
          return;
        }

        console.log(`User ${username} disconnected from ${roomId}. Starting leave timer...`);
        
        // Start a timer for "user left" notification.
        // If the user reconnects within 2 seconds, this timer is cleared in joinRoom.
        const timeoutId = setTimeout(() => {
          // Final check: did they reconnect in the meantime?
          const reconnected = Array.from(userSessionMap.values()).some(
            u => u.userId === userId && u.roomId === roomId
          );

          if (!reconnected) {
            console.log(`Leave timer expired for ${username}. Broadcasting left message.`);
            const leaveMessage = {
              _id: Date.now().toString(),
              roomId,
              encryptedText: `${username} left the chat!`,
              createdAt: new Date().toISOString(),
              sender: { username: "System" },
            };
            io.to(roomId).emit("newMessage", leaveMessage);
            // Broadcast updated participants list (user is officially gone)
            broadcastParticipants(io, roomId);
          }
          pendingDisconnects.delete(userId);
        }, 2000); 
        
        pendingDisconnects.set(userId, { timeoutId, roomId, username });
      }
    });

  });
};