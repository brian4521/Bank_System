const {Router} = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const transactionController = require("../controllers/transaction.controller")
const transactionRoute = Router()


/**
 * - post /api/transactions/
 * - new transaction create
 */
transactionRoute.post("/", authMiddleware.authMiddleware, transactionController.createTransaction)


/**
 * - post /api/transactions/system/initial-funds
 * - create initial fund transaction from system user
 */
transactionRoute.post("/system/initial-funds", authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction)

module.exports = transactionRoute