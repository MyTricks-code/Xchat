import userModel from "../models/user.model.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const createUser = async (req, res) => {
    if (!req.body) {
        return res.json({ success: false, message: "No Body" })
    }
    const { username, password } = req.body
    if (!username || !password) {
        return res.json({ success: false, message: "Missing Credentials" })
    }
    try {
        if (password.length > 20) {
            return res.json({ success: false, message: "Password too long" })
        }
        let user = await userModel.findOne({ username: username })
        if (user) {
            return res.json({ success: false, message: "User already exist" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        user = await userModel.create({
            username: username,
            password: hashedPassword
        })
        
        const token = jwt.sign({ id: user._id }, process.env.SECRET, {expiresIn:'7d'})
        const isProd = process.env.SET === 'production';
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        });
        return res.json({ success: true, message: "User created successfully" })
    } catch (err) {
        return res.json({ success: false, message: "Error creating user: ", err })
    }
}

export const login = async (req, res) => {
    if (!req.body) {
        return res.json({ success: false, message: "No Body" })
    }
    const { username, password } = req.body
    if (!username || !password) {
        return res.json({ success: false, message: "Missing Credentials" })
    }
    try {
        const user = await userModel.findOne({ username: username })
        if (!user) {
            return res.json({ success: false, messages: "No user found" })
        }
        const decryptPassword = await bcrypt.compare(password, user.password)
        if (!decryptPassword) {
            return res.json({ success: false, message: "Wrong Credentials" })
        }

        const token = jwt.sign({ id: user._id }, process.env.SECRET, {expiresIn:'7d'})
        const isProd = process.env.SET === 'production';
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        });
        return res.json({ success: true, message: "Login Successful" })
    } catch (err) {
        return res.json({ success: false, messages: "Error in login: ", err })
    }
}

export const logout = async (req, res) => {
    try {
        const isProd = process.env.SET === 'production';
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax"
        });

        return res.json({ success: true, message: "Logout Successful" });
    } catch (err) {
        return res.json({ success: false, message: "Error in logout", err });
    }
};

export const getUserInfo = async (req, res) => {
    const { userId } = req.body
    console.log(req.body)
    if (!userId) {
        return res.json({ success: false, message: "Missing Credentials" })
    }
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }
        return res.json({
            success: true,
            data: {
                name: user.username,
                id: user._id
            }
        })
    } catch (err) {
        return res.json({ success: false, message: "Error getting user info" })
    }
}
