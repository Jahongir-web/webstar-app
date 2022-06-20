const express = require("express")
const postCtrl = require("../controllers/postCtrl")
const authRole = require("../middlewares/auth")

const router = express.Router()

router.get("/post", authRole(), postCtrl.getPosts)
router.post("/post", authRole(), postCtrl.createPost)
router.put("/post/:id", authRole(), postCtrl.updatePost)
router.delete("/post/:id", authRole(), postCtrl.deletePost)


module.exports = router