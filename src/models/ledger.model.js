const mongoose = require("mongoose")

const ledgerSchema = mongoose.Schema({
  account :{
    type: mongoose.Schema.Types.ObjectId,
    ref:"account",
    required:[true,"Ledger should be associated with an account"],
    index:true,
    immutable:true
  },

  amount : {
    type: Number,
    required:[true,"Amount is required"],
    immutable:true
  },

  transaction :{
    type: mongoose.Schema.Types.ObjectId,
    ref:"transaction",
    required:[true,"Ledger should be associated with a transaction"],
    index:true,
    immutable:true
  },
  type:{ 
    type:String,
    enum:{
      values:["CREDIT","DEBIT"],
      message:"Ledger type should be either CREDIT or DEBIT",
    },
    required:[true,"Ledger type is required"],
    immutable:true
  }

})

//to make sure that the ledger is not modified after creation, we can use pre save hook to throw an error if the document is modified after creation

function avoidLedgerModification(next){
  throw new Error("Ledger cannot be modified after creation")
}


ledgerSchema.pre("findOneAndUpdate",avoidLedgerModification)
ledgerSchema.pre("updateOne",avoidLedgerModification)
ledgerSchema.pre("updateMany",avoidLedgerModification)
ledgerSchema.pre("update",avoidLedgerModification)
ledgerSchema.pre("deleteOne",avoidLedgerModification)
ledgerSchema.pre("deleteMany",avoidLedgerModification)
ledgerSchema.pre("remove",avoidLedgerModification)
ledgerSchema.pre("findOneAndDelete",avoidLedgerModification)
ledgerSchema.pre("findOneAndReplace",avoidLedgerModification)

const ledgerModel = mongoose.model("ledger",ledgerSchema)
module.exports = ledgerModel