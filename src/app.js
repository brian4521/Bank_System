const express = require('express')
const cookieParser = require("cookie-parser")


const authRouter = require('./routes/auth.routes')

const app = express();

app.use(express.json())
//by default express is not capable to read body data so we use express.json()
app.use(cookieParser())

app.use("/api/auth",authRouter)

module.exports = app;