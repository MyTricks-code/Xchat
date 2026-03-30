import jwt from 'jsonwebtoken'

const getUserId =  (req, res, next)=>{
    const token = req.cookies.token;
    if(!token){
        return res.json({success:false, message: "Not Authorized"})
    }
    try{
        const userId = jwt.verify(token, process.env.SECRET)
        req.body = {
            ...req.body,
            userId: userId.id
        }
        next()
    }catch(err){
        return res.json({success:false, message: "Error in getting userid: ", err})
    }
}

export default getUserId