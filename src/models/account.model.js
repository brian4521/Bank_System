const mongoose = require("mongoose")
const ledgerModel = require("./ledger.model")

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



accountSchema.methods.getBalance = async function(){
  const balanceData = await ledgerModel.aggregate([
    {$match:{account:this._id}},
    {$group:{
      _id:null,
      totalDebit:{
        $sum:{
          $cond:[
            {$eq:["$type","DEBIT"]},
            "$amount",
            0
          ]
        } 
      },
      totalCredit:{
        $sum:{
          $cond:[
            {$eq:["$type","CREDIT"]},
            "$amount",
            0
          ]
        }
      }
    }
    
  },
  {$project:{
    _id:0,
    balance:{$subtract:["$totalCredit","$totalDebit"]}
  }}



  ])
   if(balanceData.length === 0){
    return 0
   }
   
   return balanceData[0].balance
}




const accountModel = mongoose.model("account",accountSchema)

module.exports = accountModel


//we use index in user so that it becomes faster for search account based on only user
//we use index({}) compound index when we want to search account based on both user and status and it is faster
//ledgerModel.aggregate is pipeline which takes array and allow us to perform custom query/operation
