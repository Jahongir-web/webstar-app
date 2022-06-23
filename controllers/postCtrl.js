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

  getById: async (req, res) => {
    try {
      const {id} = req.params

      const post = await Post.findByIdAndUpdate(id, { $inc: { views: 1 } });
      if(!post) return res.json({message: "Post not found!"})
            
      return res.json(post)      
      
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
  },

  like: async (req, res) => {
    try {
      if(req.user) {
        const {id} = req.params
        const userId = req.user.id

        const post = await Post.findById(id)
        
        if(!post) return res.json({message: "Post not found!"})
  
        const {like, dislike} = post

        const checkLikeIndex = like.findIndex(index => index === userId) 
        const checkDislikeIndex = dislike.findIndex(index => index === userId) 

        if(checkLikeIndex > -1) {
          like.splice(checkLikeIndex, 1)
          await Post.findByIdAndUpdate(id, {like})
          return res.json({message: "your reaction was added post"})
        }
        if(checkDislikeIndex > -1) {
          dislike.splice(checkLikeIndex, 1)
          like.push(userId)
          await Post.findByIdAndUpdate(id, {like, dislike})     
          return res.json({message: "your reaction was added post"})
        }        
        like.push(userId)
        await Post.findByIdAndUpdate(id, {like})              
            
        return res.json({message: "your reaction was added post"})
      }

      res.status(401).json({message: "Not allowed"})
      
    } catch (error) {
      res.status(400).json({message: error.message})
    }
  },

  dislike: async (req, res) => {
    try {
      if(req.user) {
        const {id} = req.params
        const userId = req.user.id

        const post = await Post.findById(id)
        
        if(!post) return res.json({message: "Post not found!"})
  
        const {like, dislike} = post

        const checkLikeIndex = like.findIndex(index => index === userId) 
        const checkDislikeIndex = dislike.findIndex(index => index === userId) 

        if(checkLikeIndex > -1) {
          like.splice(checkLikeIndex, 1)
          dislike.push(userId)
          await Post.findByIdAndUpdate(id, {like, dislike})
          return res.json({message: "your reaction was added post"})
        }
        if(checkDislikeIndex > -1) {
          dislike.splice(checkLikeIndex, 1)
          await Post.findByIdAndUpdate(id, {dislike})     
          return res.json({message: "your reaction was added post"})
        }
        
        dislike.push(userId)
        await Post.findByIdAndUpdate(id, {dislike})    
            
        return res.json({message: "your reaction was added post"})
      }

      res.status(401).json({message: "Not allowed"})
      
    } catch (error) {
      res.status(400).json({message: error.message})
    }
  },

  getUserPosts: async (req, res) => {
    try {
      if(req.user) {
        const {id} = req.user
        
        const posts = await Post.find({authorId: id})

        if(posts.length === 0) return res.status(404).json({message: "Posts not found!"})
             
        return res.json(posts)
      }

      res.status(401).json({message: "Not allowed"})
      
    } catch (error) {
      res.status(400).json({message: error.message})
    }
  }
}

module.exports = postCtrl