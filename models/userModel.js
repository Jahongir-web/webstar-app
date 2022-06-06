const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ['user', 'admin', 'superadmin'],
    },
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    telegram: {
      type: String,
      default: null,
    },
    instagram: {
      type: String,
      default: null,
    },
    facebook: {
      type: String,
      default: null,
    },
    bithdate: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("User", userSchema)