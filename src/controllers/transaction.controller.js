const transactionModel = require('../models/transaction.model');
const accountModel = require('../models/account.model');



async function createTransaction(req,res){

  /**
   * - validate request
   */
  
  const {fromAccount, toAccount, amount, idempotencyKey} = req.body

  if(!fromAccount || !toAccount || !amount || !idempotencyKey){
    return res.status(400).json({
      message:"fromAccount, toAccount, amount and idempotencyKey are required fields"
    })
  }

  const fromUserAccount = await accountModel.findOne({
    _id:fromAccount,
  })
  
  const toUserAccount = await accountModel.findOne({
    _id:toAccount,
  })

  if(!fromUserAccount || !toUserAccount){
    return res.status(400).json({
      message:"fromAccount or toAccount not found"
    })
  }

  /**
   * - check if transaction with the same idempotencyKey already exists
   */
  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey:idempotencyKey
  })

  if(isTransactionAlreadyExists){
    if(isTransactionAlreadyExists.status === "completed"){
      return res.status(400).json({
        message:"Transaction already processed with the same idempotencyKey",
        transaction:isTransactionAlreadyExists
      })
    }
     
    if(isTransactionAlreadyExists.status === "pending"){
      return res.status(400).json({
        message:"Transaction is already in progress with the same idempotencyKey",
        
      })
    }
    if(isTransactionAlreadyExists.status === "failed"){
      return res.status(400).json({
        message:"Transaction failed with the same idempotencyKey",
        transaction:isTransactionAlreadyExists
      })
    }
  }

}
//return res.status(201).json({ should be included so that no other response below this line is executed and the response is sent to the client