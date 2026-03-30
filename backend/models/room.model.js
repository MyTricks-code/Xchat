import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({

  createdBy:{
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref : "user"
  },  

  name : {type: String, default: "Jokie"},

  roomId: {
    type: String,
    unique: true,
    required: true
  },

  lastActivity: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

const roomModel = mongoose.models.rooms || mongoose.model('rooms', roomSchema)
export default roomModel