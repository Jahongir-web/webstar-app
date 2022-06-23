const express = require("express")
const authRole = require("../middlewares/auth")
const commentCtrl = require("../controllers/commentCtrl")

const router = express.Router()

router.post("/comment", authRole(), commentCtrl.addComment)
router.put("/comment/:id", authRole(), commentCtrl.updateComment)
router.delete("/comment/:id", authRole(), commentCtrl.deleteComment)


module.exports = router