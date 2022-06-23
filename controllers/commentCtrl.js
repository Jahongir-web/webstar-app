const Comment = require("../models/commentModel")
const Post = require("../models/postModel")
const mongoose = require("mongoose")


const commentCtrl = {
  addComment: async (req, res)=> {
    try {      
      if(req.user) {
        const {postId, content} = req.body
        const authorId = req.user.id

        const post = await Post.findById(postId)
        if(!post) return res.status(404).json({message: "Post not found!"})
        
        if(!content) {
          return res.status(400).json({message: "Please write your comments!"})
        }
        const newComment = await new Comment({
          authorId,
          postId,
          content,
        })
  
        newComment.save()
  
        return res.json({message: "Comment created successfully!"})
      }

      res.status(401).json({message: "Not allowed"})      
    } catch (error) {
      res.status(400).json({message: error.message})
    }
  },

  updateComment: async (req, res) => {
    try {

      if(req.user) {
        const {id} = req.params
        const comment = await Comment.findById(id)
        if(!comment) return res.json({message: "Comment not found!"})

        if(req.user.role === 'admin'){
          const comment = await Comment.findByIdAndUpdate(id, req.body)       
              
          return res.json({message: "Comment Updated!"})
        }
        if(`${comment.authorId}` == new mongoose.Types.ObjectId(`${req.user.id}`)) {
          const comment = await Comment.findByIdAndUpdate(id, req.body)       
              
          return res.json({message: "Comment Updated!"})
        }       
        return res.status(401).json({message: "Not allowed"})
      }
      res.status(401).json({message: "Not allowed"}) 
    } catch (error) {
      res.status(400).json({message: error.message})
    }

  },

  deleteComment: async (req, res) => {
    try {
      if(req.user) {
        const {id} = req.params
        const comment = await Comment.findById(id)
        if(!comment) return res.json({message: "Comment not found!"})

        if(req.user.role === 'admin'){
          await Comment.findByIdAndDelete(id)
          return res.json({message: "Comment Deleted!"})
        }
        if(`${comment.authorId}` == new mongoose.Types.ObjectId(`${req.user.id}`)) {
          await Comment.findByIdAndDelete(id)
          return res.json({message: "Comment Deleted!"})
        }       
        return res.status(401).json({message: "Not allowed"})
      }
      res.status(401).json({message: "Not allowed"}) 
    } catch (error) {
      res.status(400).json({message: error.message})
    }
  }
}

module.exports = commentCtrl