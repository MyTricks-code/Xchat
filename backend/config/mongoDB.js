import mongoose from "mongoose";

const connectDB = async(req, res)=>{
    const db = await mongoose.connect(`${process.env.MONGO_URI}`, {
      dbName: "xchat",
    });
    mongoose.connection.on('connected', () => {
     console.log('database connected')
    })
}

export default connectDB