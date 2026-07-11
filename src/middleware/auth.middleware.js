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

async function authSystemUserMiddleware(req,res,next){
  
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
  
  if(!token){
    return res.status(401).json({
      message:"unauthorized access, token is absent"
    })
  }

  try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    const user = await userModel.findById(decoded.userId).select("+systemUser")

    if (!user.systemUser) {
      return res.status(403).json({
        message: "Forbidden access, user is not a system user"
      })
    }
   // if the systemUser field is false then it will execute the above block and return 403 forbidden access. If it is true then it will execute the below block and attach the user to req.user and call next() to proceed to the next middleware or route handler.
    req.user = user
    return next()
  }
  catch(error){
    return res.status(401).json({
      message:"token is invalid"
    })

  }

}

module.exports = {
  authMiddleware,
  authSystemUserMiddleware
}