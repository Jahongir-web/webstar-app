const fs = require("fs")
const Post = require("../models/postModel")

const {uploadedFile, deleteFile, removeTmp} = require("../services/upload")


const postCtrl = {
  createPost: async (req, res)=> {
    try {
      const {authorId, title, content} = req.body
      const image = req.files.image

      if(!authorId || !title || !image || !content) {
        return res.status(400).json({message: "Please fill all the fields!"})
      }

      if (image.mimetype !== "image/jpeg" && image.mimetype !== "image/png" && image.mimetype !== "image/svg+xml") {
        removeTmp(image.tempFilePath);
        return res.status(400).json({ message: "File format is should png or jpeg" });
      }

      const imgPost = await uploadedFile(image)

      const newPost = await new Post({
        authorId,
        title,
        image: imgPost,
        content,
      })

      newPost.save()

      res.status(201).json({message: "Post created successfully!"})
      
    } catch (error) {
      res.status(400).json({message: error})
    }
  },

  getPosts: async (req, res)=> {
    try {
      const posts = await Post.find({public: true})
      res.status(200).json(posts)
    } catch (error) {
      res.status(400).json({message: error.message})
    }
  },

  updatePost: async (req, res) => {
    try {
      const {id} = req.params
      
      if(req.files) {
        const image = req.files.image
        if (image.mimetype !== "image/jpeg" && image.mimetype !== "image/png") {
          removeTmp(image.tempFilePath);
          return res.status(400).json({ message: "File format is should png or jpeg" });
        }
  
        const imgPost = await uploadedFile(image)
        req.body.image = imgPost
      }
      const post = await Post.findByIdAndUpdate(id, req.body)

      if(!post) return res.json({message: "Post not found!"})
          
      res.json({message: "Post Updated!"})
      
    } catch (error) {
      res.status(400).json({message: error.message})
    }

  },

  deletePost: async (req, res) => {
    try {
      const {id} = req.params
      
      const post = await Post.findByIdAndDelete(id)
      
      if(!post) return res.json({message: "Post not found!"})

      const postImgId = post.image.public_id

      await deleteFile(postImgId)
          
      res.json({message: "Post Deleted!"})
      
    } catch (error) {
      res.status(400).json({message: error.message})
    }
  }
}

module.exports = postCtrl