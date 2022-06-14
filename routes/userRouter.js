const express = require('express')
const userCtrl = require("../controllers/userCtrl")

const router = express.Router()

router.post('/signup', userCtrl.signUp)

router.post('/login', userCtrl.login)

router.get('/', userCtrl.userInfo)

module.exports = router