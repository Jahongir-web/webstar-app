const express = require('express')

const userRouter = require('./userRouter')
const postRouter = require('./postRouter')

const router = express.Router()

router.use("/", userRouter)
router.use("/", postRouter)

module.exports = router