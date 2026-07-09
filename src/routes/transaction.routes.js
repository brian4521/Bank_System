const {Router} = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const transactionController = require("../controllers/transaction.controller")
const transactionRoute = Router()


/**
 * - post /api/transactions/
 * - new transaction create
 */
transactionRoute.post("/", authMiddleware.authMiddleware, transactionController.createTransaction)

module.exports = transactionRoute