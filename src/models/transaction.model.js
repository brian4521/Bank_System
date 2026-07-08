const mongoose = require("mongoose")

const transactionSchema = mongoose.Schema({
  fromAccount :{
    type: mongoose.Schema.Types.ObjectId,
    ref:"account",
    required:[true,"Transaction should be associated with a from account"],
    index:true
  },
  toAccount :{
    type: mongoose.Schema.Types.ObjectId,
    ref:"account",
    required:[true,"Transaction should be associated with a to account"],
    index:true
  },
  status:{
    type:String,
    enum:{
      values:["PENDING","SUCCESS","FAILED","Reversed"],
      message:"Transaction status should be either PENDING, SUCCESS, FAILED or Reversed",
    },
    default:"PENDING"
  },
  amount:{
    type:Number,
    required:[true,"Transaction amount is required"],
    min:[1,"Transaction amount should be greater than 0"]
  },
  idempotencyKey:{
    type:String,
    required:[true,"Idempotency key is required for transaction"],
    index:true,
    unique:true
  }
},
{
  timestamps:true
}
)

const transactionModel = mongoose.model("transaction",transactionSchema)

module.exports = transactionModel 