const accountModel = require('../models/account.model')


async function createAccountController(req,res,next){
  const user = req.user

  const account = await accountModel.create({
    user:user._id
  })

  res.status(201).json({
    account
  })
}


module.exports = {
  createAccountController
}



//Note-  we need only user id to be provided to account.model which is done by middleware(auth.middleware) and remaining datas are already filled by model itself