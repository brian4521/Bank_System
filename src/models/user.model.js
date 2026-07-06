const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please follow email format"],
    unique: [true, "Email already exist"]
  },
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "at least 6 character needed"],
    select: false
  }
}, {
  timestamps: true
})

userSchema.pre("save", async function () {

  if (!this.isModified("password")) {
    return 
  }

  const hash = await bcrypt.hash(this.password, 10)
  this.password = hash
  return 

})

userSchema.methods.comparePassword = async function (password){
  console.log(password,this.password)
  return await bcrypt.compare(password,this.password)
}

const userModel = mongoose.model("user", userSchema)

module.exports = userModel

//debug-1. when using asyn then donot use next() 2. Remember (password,this.password) this.password is read from db
//Here comparePassword is userdefined