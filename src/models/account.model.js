const mongoose = require("mongoose")

const accountSchema = mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:[true,"Account should be associated with a user"],
    index:true
  },
  status:{
    type:String,
    enum:{
      values:["ACTIVE","FROZEN","CLOSED"],
      message:"Account status should be either ACTIVE, FROZEN or CLOSED",
     
    },
    
    default:"ACTIVE"
    
  },
  currency:{
    type:String,
    required:[true,"Currency is required for account"],
    default:"USD"
  }, 

},{
  timestamps:true
}
)   

accountSchema.index({user:1, status:1})



const accountModel = mongoose.model("account",accountSchema)

module.exports = accountModel


//we use index in user so that it becomes faster for search account based on only user
//we use index({}) compound index when we want to search account based on both user and status and it is faster