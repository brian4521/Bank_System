const {Router} = require("express")
const authMiddleware = require("../middleware/auth.middleware")

const transactionRoute = Router()


/**
 * - post /api/transactions/
 * - new transaction create
 */
transactionRoute.post("/", authMiddleware.authMiddleware,)

module.exports = transactionRoute