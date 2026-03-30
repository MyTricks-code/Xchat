import messageModel from "../models/messages.model.js";

export const saveMessage = async (data) => {
  return await messageModel.create({
    ...data,
    expiresAt: new Date(Date.now() + 3600000)
  });
};