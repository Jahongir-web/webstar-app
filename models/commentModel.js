const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },
    content: {
      type: String,
      required: true,
    },
    like: Array,
    dislike: Array,
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Comment", commentSchema)