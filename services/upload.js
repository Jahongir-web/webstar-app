const cloudinary = require("cloudinary")
const fs = require("fs")
const dotenv = require('dotenv')
dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
})

const removeTmp = (path) => {
  fs.unlink(path, err => {
    if(err) throw err;
  })
}


const uploadedFile = async (file) => {
  let image = {}
  await cloudinary.v2.uploader.upload(file.tempFilePath, {folder: "Food app"}, async(err, result) => {
    if(err) throw err

    removeTmp(file.tempFilePath);
    return image = {url: result.secure_url, public_id: result.public_id};
  })
  return image
}

const deleteFile = async (public_id)=> {
  let deleted = false
  await cloudinary.v2.uploader.destroy(public_id, async (err, result) => {
    if(err) throw err;
    return deleted = true
  })
  if(deleted) {
    return "file deleted"
  }else {
    return "file not found"
  }
}

module.exports = {uploadedFile, deleteFile, removeTmp}

