const express = require("express")
const postCtrl = require("../controllers/postCtrl")
const authRole = require("../middlewares/auth")

const router = express.Router()

router.get("/post", authRole(), postCtrl.getPosts)
router.post("/post", authRole(), postCtrl.createPost)
router.put("/post/:id", authRole(), postCtrl.updatePost)
router.delete("/post/:id", authRole(), postCtrl.deletePost)
router.get("/my", authRole(), postCtrl.getUserPosts)
router.get("/post/:id", postCtrl.getById)
router.post("/like/:id", authRole(), postCtrl.like)
router.post("/dislike/:id", authRole(), postCtrl.dislike)



module.exports = router