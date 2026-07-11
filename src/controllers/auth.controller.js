const userModel = require("../models/user.model")
const emailService = require("../services/email.service")
const jwt = require("jsonwebtoken")




/**
 * - user register controller
 * - post /api/auth/register
 */
async function userRegisterController(req,res){   
  const {email,password,name} = req.body

  const isexists = await userModel.findOne({
    email:email
  })

  if(isexists){
    return res.status(422).json({
      message : "user already exist with this email",
      status:"failed"
    })
  }

  const user = await userModel.create({
    email,password,name
  })

  const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{
    expiresIn:"3d"
  })

  res.cookie("token",token) 

  res.status(201).json({
    user:{
      _id:user._id,
      email:user.email,
      name:user.name

    },
    token
  })

  await emailService.sendRegistrationEmail(user.email,user.name)

}

/**
 * - user login controller
 * - /api/auth/login
 */
async function userLoginController(req,res){

  const {email,password} = req.body
  const user = await userModel.findOne({email}).select("+password")

  if(!user){
    res.status(401).json({
      message:"Email or password is INVALID"
    })

  }

  const isValidPassword = await user.comparePassword(password)

  //here we are using user.comparePassword since user variable also contain password above select("+password")

  if(!isValidPassword){
      res.status(401).json({
      message:"Email or password is INVALID"
    })
  }
  const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{
    expiresIn:"3d"
  })

  res.cookie("token",token)

  res.status(200).json({
    user:{
      _id:user._id,
      email:user.email,
      name:user.name
    },
    token
  })

  

}


// npm i jsonwebtoken cookie-parser


module.exports = {
  userRegisterController,
  userLoginController
}


//debug-1.res.cookie not cookies