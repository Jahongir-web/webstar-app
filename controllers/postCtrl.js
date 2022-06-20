const fs = require("fs")
const Post = require("../models/postModel")

const {uploadedFile, deleteFile, removeTmp} = require("../services/upload")


const postCtrl = {
  createPost: async (req, res)=> {
    try {
      if(req.user) {
        const {title, content} = req.body
        const authorId = req.user.id
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
  
        return res.status(201).json({message: "Post created successfully!"})
      }
      
      res.status(401).json({message: "Not allowed"})
      
    } catch (error) {
      res.status(400).json({message: error})
    }
  },

  getPosts: async (req, res)=> {
    try {
      if(req.user && req.user.role === "admin") {
        const posts = await Post.find()
        return res.status(200).json(posts)
      }

      const posts = await Post.find({public: true})
      res.status(200).json(posts)

    } catch (error) {
      res.status(400).json({message: error.message})
    }
  },

  updatePost: async (req, res) => {
    try {
      const {id} = req.params

      const post = await Post.findById(id)
      if(!post) return res.json({message: "Post not found!"})

      if(req.user) {

        if(req.files) {
          const image = req.files.image
          if (image.mimetype !== "image/jpeg" && image.mimetype !== "image/png") {
            removeTmp(image.tempFilePath);
            return res.status(400).json({ message: "File format is should png or jpeg" });
          }
    
          const imgPost = await uploadedFile(image)
          req.body.image = imgPost
        }
        await Post.findByIdAndUpdate(id, req.body)
            
        return res.json({message: "Post Updated!"})
      }

      res.status(401).json({message: "Not allowed"})
      
    } catch (error) {
      res.status(400).json({message: error.message})
    }

  },

  deletePost: async (req, res) => {
    try {
      if(req.user) {
        const {id} = req.params
        
        const post = await Post.findByIdAndDelete(id)
        
        if(!post) return res.json({message: "Post not found!"})
  
        const postImgId = post.image.public_id
  
        await deleteFile(postImgId)
            
        return res.json({message: "Post Deleted!"})
      }

      res.status(401).json({message: "Not allowed"})
      
    } catch (error) {
      res.status(400).json({message: error.message})
    }
  }
}

module.exports = postCtrl