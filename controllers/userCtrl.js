const User = require("../models/userModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const dotenv = require('dotenv')
dotenv.config()

const userCtrl = {
  login: async (req, res)=> {
    try {
      const {email, password} = req.body

      if(!email || !password) {
        return res.status(400).json({message: "Please fill all the fields!"})
      }

      const user = await User.findOne({email})

      if(!user) {
        return res.status(400).json({message: "User not found!"})
      }

      const verifyPassword = await bcrypt.compare(password, user.password)

      if(!verifyPassword) {
        return res.status(401).json({message: "Invalid credentials"})
      }

      const token = jwt.sign({id: user._id, role: user.role, name: user.name, surname: user.surname, avatar: user.avatar}, process.env.SECRET_KEY, {expiresIn: "1h"})

      res.status(200).json({message: "Login successfully!", token: token})
    } catch (error) {
      res.status(400).json({message: error.message})
    }
  },

  signUp: async (req, res)=> {
    try {
      const {name, surname, email, password } = req.body

      if(!email || !password || !name || !surname ){
        return res.status(400).json({message: "Please fill all the fields!"})
      }

      const checkUser = await User.findOne({email})

      if(checkUser) {
        return res.status(401).json({message: "this email is already registered"})
      }

      const hashPassword = await bcrypt.hash(password, 8)

      const user = await new User({
        role: 'user',
        name,
        surname,
        email,
        password: hashPassword,
      })
      await user.save()

      res.status(201).json({message: "Signup successfully!"})
    } catch (error) {
      res.status(400).json({message: error.message})
    }
  },

  userInfo: async(req, res)=> {
    try {
      const {access_token} = req.headers
      if(access_token){
        const {id, role, name, surname, avatar} = jwt.verify(access_token, process.env.SECRET_KEY)
        return res.status(200).json({user:{id, role, name, surname, avatar}})
      }
      else {
        return res.status(200).json({message: "Kirish amalga oshmagan!"})
      }
    } catch (error) {
      res.status(400).json({message: error.message})
    }
  }
}

module.exports = userCtrl