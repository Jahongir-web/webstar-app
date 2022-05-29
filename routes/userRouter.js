const express = require('express')

const userCtrl = require("../controllers/userCtrl")

const router = express.Router()

router.get('/signup', userCtrl.gretting)

module.exports = router