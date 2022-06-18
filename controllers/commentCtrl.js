const Comment = require("../models/commentModel")

const commentCtrl = {
  addComment: async (req, res)=> {
    try {
      const {authorId, postId, content} = req.body

      if(!authorId || !postId || !content) {
        return res.status(400).json({message: "Please fill all the fields!"})
      }

      const newComment = await new Comment({
        authorId,
        postId,
        content,
      })

      newComment.save()

      res.json({message: "Comment created successfully!"})
      
    } catch (error) {
      res.status(400).json({message: error.message})
    }
  },

  updateComment: async (req, res) => {
    try {
      const {id} = req.params
      const comment = await Comment.findByIdAndUpdate(id, req.body)

      if(!comment) return res.json({message: "Comment not found!"})
          
      res.json({message: "Comment Updated!"})
      
    } catch (error) {
      res.status(400).json({message: error.message})
    }

  },

  deleteComment: async (req, res) => {
    try {
      const {id} = req.params
      
      const comment = await Comment.findByIdAndDelete(id)

      if(!comment) return res.json({message: "Comment not found!"})
          
      res.json({message: "Comment Deleted!"})
      
    } catch (error) {
      res.status(400).json({message: error.message})
    }
  }
}

module.exports = commentCtrl