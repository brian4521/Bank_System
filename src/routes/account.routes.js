const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")

const router = express.Router()

/**
 * - post /api/accounts
 * - create new account
 * - procted route
 */

router.post("/",authMiddleware.authMiddleware)




module.exports = router