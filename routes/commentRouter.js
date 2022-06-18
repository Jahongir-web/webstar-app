const express = require("express")
const commentCtrl = require("../controllers/commentCtrl")

const router = express.Router()

router.post("/comment", commentCtrl.addComment)
// router.post("/post", postCtrl.createPost)
router.put("/comment/:id", commentCtrl.updateComment)
router.delete("/comment/:id", commentCtrl.deleteComment)


module.exports = router