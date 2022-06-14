const fs = require("fs")
const Post = require("../models/postModel")

const {uploadedFile, deleteFile, removeTmp} = require("../services/upload")


const postCtrl = {
  createPost: async (req, res)=> {
    try {
      const {authorId, title, content} = req.body
      const image = await req.files.image

      if(!authorId || !title || !image || !content) {
        return res.status(400).json({message: "Please fill all the fields!"})
      }

      if (image.mimetype !== "image/jpeg" && image.mimetype !== "image/png") {
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
    const {id} = req.params

    
    
    res.send({data:req.body, id})
  }
}

module.exports = postCtrl