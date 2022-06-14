const mongoose = require("mongoose")

const postSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    image: {
      type: Object,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    public: {
      type: Boolean,
      default: true,
    },
    like: Array,
    dislike: Array,
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Post", postSchema)