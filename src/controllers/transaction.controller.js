const transactionModel = require('../models/transaction.model');
const accountModel = require('../models/account.model');



async function createTransaction(req,res){
  
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


}


//return res.status(201).json({ should be included so that no other response below this line is executed and the response is sent to the client