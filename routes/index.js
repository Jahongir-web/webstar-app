const express = require('express')

const userRouter = require('./userRouter')
const postRouter = require('./postRouter')
const commentRouter = require('./commentRouter')

const router = express.Router()

router.use("/", userRouter)
router.use("/", postRouter)
router.use("/", commentRouter)

module.exports = router