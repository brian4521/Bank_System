const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")



async function authMiddleware(req,res,next){

  const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
  
  if(!token){
    return res.status(401).json({
      message:"unauthorized access, token is absent"
    })
  }

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await userModel.findById(decoded.userId)

    req.user = user
    //it contains the user id that is matched with model userId
    return next()

  }catch(error){
    return res.status(401).json({
      message:"token is invalid"
    })
  }
}

module.exports = {
  authMiddleware
}