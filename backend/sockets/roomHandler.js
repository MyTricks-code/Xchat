export const handleJoinRoom = (io, socket, { roomId, username }, shouldNotify = true) => {
  socket.join(roomId);
  
  if (shouldNotify && username) {
    const joinMessage = {
      _id: Date.now().toString(),
      roomId,
      encryptedText: `${username} joined the chat!`,
      createdAt: new Date().toISOString(),
      sender: { username: "System" },
    };
    io.to(roomId).emit("newMessage", joinMessage);
  }
};