const fs = require("fs")
const Post = require("../models/postModel")
const Comment = require("../models/commentModel")


const {uploadedFile, deleteFile, removeTmp} = require("../services/upload")
const { default: mongoose } = require("mongoose")


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
        const posts = await Post.aggregate([
          {$match: {}},
          {$lookup: {from: "comments", let: {postId: "$_id"},
              pipeline: [
                {$match: {$expr: {$eq: ["$postId", "$$postId"]}}},
                {$lookup: {from: "users", let: {authorId: "$authorId"},
                pipeline: [
                  {$match: {$expr: {$eq: ["$_id", "$$authorId"]}}},
                  {
                    $project: {
                      name: 1,
                      surname: 1
                    }
                  }
                ],
                as: "author",
              }
              }
              ],
              as: "comments",
            }
          },
          {$lookup: {from: "users", let: {authorId: "$authorId"},
                pipeline: [
                  {$match: {$expr: {$eq: ["$_id", "$$authorId"]}}},
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      surname: 1,
                      email: 1
                    }
                  }
                ],
              as: "author",
            }
          }
        ])
        return res.status(200).json(posts)
      }

      const posts = await Post.aggregate([
        {$match: {public: true}},
        {$lookup: {from: "comments", let: {postId: "$_id"},
            pipeline: [
              {$match: {$expr: {$eq: ["$postId", "$$postId"]}}},
              {$lookup: {from: "users", let: {authorId: "$authorId"},
              pipeline: [
                {$match: {$expr: {$eq: ["$_id", "$$authorId"]}}},
                {
                  $project: {
                    name: 1,
                    surname: 1
                  }
                }
              ],
              as: "author",
              }
              }
            ],
            as: "comments",
          }
        },
        {$lookup: {from: "users", let: {authorId: "$authorId"},
              pipeline: [
                {$match: {$expr: {$eq: ["$_id", "$$authorId"]}}},
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    surname: 1,
                    email: 1
                  }
                }
              ],
            as: "author",
          }
        }
      ])
      res.status(200).json(posts)

    } catch (error) {
      res.json(error)
    }
  },

  updatePost: async (req, res) => {
    try {
      const {id} = req.params

      const post = await Post.findById(id)
      if(!post) return res.json({message: "Post not found!"})

      if(req.user) {

        if(req.user.role === 'admin' || `${post.authorId}` == new mongoose.Types.ObjectId(`${req.user.id}`)) {
          if(req.files) {
            const image = req.files.image
            if (image.mimetype !== "image/jpeg" && image.mimetype !== "image/png") {
              removeTmp(image.tempFilePath);
              return res.status(400).json({ message: "File format is should png or jpeg" });
            }
            
            const imgPost = await uploadedFile(image)
            req.body.image = imgPost

            const postImgId = post.image.public_id 
            await deleteFile(postImgId)
          }
          
          await Post.findByIdAndUpdate(id, req.body)
              
          return res.json({message: "Post Updated!"})
        }
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

      const posts = await Post.aggregate([
        {$match: {_id: new mongoose.Types.ObjectId(id)}},
        {$lookup: {from: "comments", let: {postId: "$_id"},
            pipeline: [
              {$match: {$expr: {$eq: ["$postId", "$$postId"]}}},
              {$lookup: {from: "users", let: {authorId: "$authorId"},
              pipeline: [
                {$match: {$expr: {$eq: ["$_id", "$$authorId"]}}},
                {
                  $project: {
                    name: 1,
                    surname: 1
                  }
                }
              ],
              as: "author",
              }
              }
            ],
            as: "comments",
          }
        },
        {$lookup: {from: "users", let: {authorId: "$authorId"},
              pipeline: [
                {$match: {$expr: {$eq: ["$_id", "$$authorId"]}}},
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    surname: 1,
                    email: 1
                  }
                }
              ],
            as: "author",
          }
        }
      ])
      return res.status(200).json(posts)      
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

        if(req.user.role === 'admin') {
          await deleteFile(postImgId)              
          return res.json({message: "Post Deleted!"})
        }
  
        if(`${post.authorId}` == new mongoose.Types.ObjectId(`${req.user.id}`)) {
          await deleteFile(postImgId)              
          return res.json({message: "Post Deleted!"})
        }
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

  searchPost: async (req, res) => {
    try {
      const {title} = req.query
      if(req.user && req.user.role === "admin") {
        const result = await Post.aggregate([
          {$match: {title: { $regex: title, $options: 'i' }}},
          {$lookup: {from: "comments", let: {postId: "$_id"},
              pipeline: [
                {$match: {$expr: {$eq: ["$postId", "$$postId"]}}},
                {$lookup: {from: "users", let: {authorId: "$authorId"},
                pipeline: [
                  {$match: {$expr: {$eq: ["$_id", "$$authorId"]}}},
                  {
                    $project: {
                      name: 1,
                      surname: 1
                    }
                  }
                ],
                as: "author",
              }
              }
              ],
              as: "comments",
            }
          },
          {$lookup: {from: "users", let: {authorId: "$authorId"},
                pipeline: [
                  {$match: {$expr: {$eq: ["$_id", "$$authorId"]}}},
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      surname: 1,
                      email: 1
                    }
                  }
                ],
              as: "author",
            }
          }
        ])
    
        return res.status(200).send(result)
      }

      const result = await Post.aggregate([
        {$match: {title: { $regex: title, $options: 'i' }}},
        {$match: {public: true}},
        {$lookup: {from: "comments", let: {postId: "$_id"},
            pipeline: [
              {$match: {$expr: {$eq: ["$postId", "$$postId"]}}},
              {$lookup: {from: "users", let: {authorId: "$authorId"},
              pipeline: [
                {$match: {$expr: {$eq: ["$_id", "$$authorId"]}}},
                {
                  $project: {
                    name: 1,
                    surname: 1
                  }
                }
              ],
              as: "author",
            }
            }
            ],
            as: "comments",
          }
        },
        {$lookup: {from: "users", let: {authorId: "$authorId"},
              pipeline: [
                {$match: {$expr: {$eq: ["$_id", "$$authorId"]}}},
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    surname: 1,
                    email: 1
                  }
                }
              ],
            as: "author",
          }
        }
      ])
  
      res.status(200).send(result)

    } catch (error) {
      
    }
  },

  getUserPosts: async (req, res) => {
    try {
      if(req.user) {
        const {id} = req.user
        
        const posts = await Post.aggregate([
          {$match: {authorId: new mongoose.Types.ObjectId(id)}},
          {$lookup: {from: "comments", let: {postId: "$_id"},
              pipeline: [
                {$match: {$expr: {$eq: ["$postId", "$$postId"]}}},
                {$lookup: {from: "users", let: {authorId: "$authorId"},
                pipeline: [
                  {$match: {$expr: {$eq: ["$_id", "$$authorId"]}}},
                  {
                    $project: {
                      name: 1,
                      surname: 1
                    }
                  }
                ],
                as: "author",
              }
              }
              ],
              as: "comments",
            }
          },
          {$lookup: {from: "users", let: {authorId: "$authorId"},
                pipeline: [
                  {$match: {$expr: {$eq: ["$_id", "$$authorId"]}}},
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      surname: 1,
                      email: 1
                    }
                  }
                ],
              as: "author",
            }
          }
        ])
        return res.status(200).json(posts)
      }

      res.status(401).json({message: "Not allowed"})
      
    } catch (error) {
      res.status(400).json({message: error.message})
    }
  }
}

module.exports = postCtrl