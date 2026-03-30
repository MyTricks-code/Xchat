import roomModel from "../models/room.model.js";
import messageModel from "../models/messages.model.js";

export const createRoom = async (req, res) => {
  if (!req.body) {
    return res.json({ success: false, message: "No Body" });
  }
  const { roomId, name, userId } = req.body;
  if (!roomId) {
    return res.json({ success: false, message: "Missing Credentials" });
  }
  try {
    const existingRoom = await roomModel.findOne({ roomId });
    if (existingRoom) {
      return res.json({ success: false, message: "Room ID already exists" });
    }

    const room = await roomModel.create({
      roomId: roomId,
      name: name || "Jokie",
      createdBy: userId,
    });

    return res.json({
      success: true,
      message: "Room created Successfully",
      room,
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "error creating room: ",
      error: err.message,
    });
  }
};

export const joinRoom = async(req, res)=>{
    if(!req.body){
        return res.json({success: false, message : "No Body"})
    }
    const {roomId} = req.body
    if(!roomId){
        return res.json({success:false, message: "Missing Credentials"})
    }
    try{
        const room = await roomModel.findOne({roomId:roomId})
        if(!room){
            return res.json({success: false, message : "No Room Find"})
        }
        const message = await messageModel.find({roomId: roomId}).populate('sender', 'username')
        return res.json({
            success : true,
            message: "Successfully joined room",
            room : room,
            messages: message
        })
    }catch(err){
        return res.json({success:false, message: "Error joining room", err})
    }
}
 
export const deleteRoom = async (req, res) => {
  if (!req.body) {
    return res.json({ success: false, message: "No Body" });
  }
  const { userId, roomId } = req.body;
  if (!userId || !roomId) {
    return res.json({ success: false, message: "Missing credentials" });
  }
  try {
    const room = await roomModel.findOneAndDelete({
      roomId: roomId,
      createdBy: userId,
    });
    if (!room) {
      return res.json({
        success: false,
        message: "Only the creator can delete this room",
      });
    }
    return res.json({ success: true, message: "Room deleted Successfully" });
  } catch (err) {
    return res.json({
      success: false,
      message: "Error deleting room",
      error: err.message,
    });
  }
};

export const getRoom = async (req, res) => {
    const { roomId } = req.params;
    if (!roomId) {
        return res.json({ success: false, message: "Missing Credentials" });
    }
    try {
        const room = await roomModel.findOne({ roomId: roomId });
        if (!room) {
            return res.json({ success: false, message: "No Room Find" });
        }
        const messages = await messageModel.find({ roomId: roomId }).populate('sender', 'username');
        return res.json({
            success: true,
            message: "Successfully fetched room info",
            room: room,
            messages: messages
        });
    } catch (err) {
        return res.json({ success: false, message: "Error fetching room info", err });
    }
};