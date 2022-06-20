const jwt = require("jsonwebtoken")
const dotenv = require('dotenv')
dotenv.config()

const authRole = () => {
  return async (req, res, next) => {
    try {
      const {access_token} = req.headers

      if(!access_token){
        return next()
      }
      jwt.verify(access_token, process.env.SECRET_KEY, (err, user)=> {
        if(err){
          return res.status(403).json({message: err.message})
        }
        req.user = user
      })
      next()
    } catch (error) {
      return res.status(400).send("Invalid token!");
    }
  } 
}

module.exports = authRole