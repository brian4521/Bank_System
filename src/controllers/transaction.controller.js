const transactionModel = require('../models/transaction.model');
const accountModel = require('../models/account.model');
const ledgerModel = require('../models/ledger.model');
const emailService = require('../services/email.service');
const mongoose = require('mongoose');



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
    if(isTransactionAlreadyExists.status === "reversed"){
      return res.status(400).json({
        message:"Transaction was reversed ",
        transaction:isTransactionAlreadyExists
      })
    }
  }

  /**
   * check account status
   */
  if(fromUserAccount.status !== "active" || toUserAccount.status !== "active"){
    return res.status(400).json({
      message:"fromAccount or toAccount is not active"
    })
  }


  /**
   * -derive sender ledger balance and check if sufficient funds are available
   */

  const balance = await fromUserAccount.getBalance();

  if(balance < amount){
    return res.status(400).json({
      message:`Insufficient funds in fromAccount. Current balance is ${balance}. Requested amount is ${amount}`
    })
  }

  /**
   * - create transaction (pending)
   */

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = await transactionModel.create({
    fromAccount:fromAccount,
    toAccount:toAccount,
    amount:amount,
    idempotencyKey:idempotencyKey,
    status:"PENDING"
  },{session:session})


  const debitLedgerEntry = await ledgerModel.create({
    account:fromAccount,
    amount:amount,
    transaction:transaction._id,
    type:"debit"
  },{session:session})

  const creditLedgerEntry = await ledgerModel.create({
    account:toAccount,
    amount:amount,
    transaction:transaction._id,
    type:"credit"
  },{session:session})

  transaction.status = "COMPLETED"
  await transaction.save({session:session})

  await session.commitTransaction();
  session.endSession();

  /**
   * - send email notification
   */

  await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount);

  return res.status(201).json({
    message:"Transaction completed successfully",
    transaction:transaction
  })


}



async function createInitialFundsTransaction(req,res){
  const {toAccount, amount, idempotencyKey} = req.body

  if(!toAccount || !amount || !idempotencyKey){
    return res.status(400).json({
      message:"toAccount, amount and idempotencyKey are required fields"
    })
  }

  const toUserAccount = await accountModel.findOne({
    _id:toAccount
  })

  if(!toUserAccount){
    return res.status(400).json({
      message:"toAccount not found"
    })
  }


  const fromUserAccount = await accountModel.findOne({
    user:req.user._id
  })
  //this comes from authSystemUserMiddleware which is executed before this controller function. The authSystemUserMiddleware decodes the JWT token and attaches the user information to the req object.

  // we dont have to mention systemUser:true because accountModel does not have systemUsed fied


  if(!fromUserAccount){
    return res.status(400).json({
      message:"System user account not found"
    })
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = new transactionModel({
    fromAccount:fromUserAccount._id,
    toAccount:toAccount,
    amount:amount,
    idempotencyKey:idempotencyKey,

    status:"PENDING"
  })



  const debitLedgerEntry = await ledgerModel.create([{
    account:fromUserAccount._id,
    amount:amount,
    transaction:transaction._id,
    type:"DEBIT"
  }],{session:session})

  //note when using session with create method, we have to pass an array of objects to create method. Hence we are using [] around the object.
  const creditLedgerEntry = await ledgerModel.create([{
    account:toAccount,
    amount:amount,
    transaction:transaction._id,
    type:"CREDIT"
  }],{session:session})
 
  transaction.status = "COMPLETED"
  await transaction.save({session:session})

  await session.commitTransaction();
  session.endSession();

  return res.status(201).json({
    message:"Initial funds transaction completed successfully",
    transaction:transaction
  })
  
}

module.exports ={
  createTransaction,
  createInitialFundsTransaction
}




//return res.status(201).json({ should be included so that no other response below this line is executed and the response is sent to the client

//since action is taken by from account so we send email to from account user. 
// note- req.user.email and req.user.name are retrieved from the auth middleware which is executed before this controller function. The auth middleware decodes the JWT token and attaches the user information to the req object.

// in createInitialFundsTransaction, we dont check for sufficient funds in the system user account because it is assumed that the system user has unlimited funds. However, in a real-world scenario, you might want to implement some checks or limits for the system user as well.

