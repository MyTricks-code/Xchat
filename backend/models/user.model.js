import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username : {type: String, unique: true, required: true},
    password: {type: String, required: true},
    friends : [{
        type: mongoose.Schema.ObjectId,
        ref : "user"
    }],
    rooms : [{
        type: mongoose.Schema.ObjectId,
        ref:"rooms"
    }]
}, {timestamps: true})

const userModel = mongoose.models.user || mongoose.model('user', userSchema)
export default userModel