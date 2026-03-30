import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },

  // encrypted message (VERY IMPORTANT)
  encryptedText: String,

  // auto delete after 1 hour
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600
  }

});

// to treat roomId as index for fast queries
messageSchema.index({ roomId: 1, createdAt: -1 });

const messageModel = mongoose.models.message || mongoose.model('Messages', messageSchema)
export default messageModel