const express = require("express")
const postCtrl = require("../controllers/postCtrl")

const router = express.Router()

router.get("/post", postCtrl.getPosts)
router.post("/post", postCtrl.createPost)
router.put("/post/:id", postCtrl.updatePost)
router.delete("/post/:id", postCtrl.deletePost)


module.exports = router