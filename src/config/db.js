const mongoose = require("mongoose");


function connectDB(){
  mongoose.connect(process.env.MONGO_URI)
  .then(()=>{
    console.log("connected to MongoDB")
  })
  .catch(err=>{
    console.log(err)
  })
}

module.exports = connectDB