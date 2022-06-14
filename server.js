const express = require('express')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

const routes = require('./routes/index.js')

dotenv.config()

const app = express()

const PORT = process.env.PORT || 4001;

// MongoDb URL
const URL = process.env.MONGO_URL

// Middlewares
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(fileUpload({
  useTempFiles: true,
}))

// Routes
app.use("/api", routes)

const start = async ()=> {
  try {
    await mongoose.connect(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    
    app.listen(PORT, ()=>{
      console.log(`Server started on port: ${PORT}`);
    })
  } catch (err) {
    console.log(err.message);
    process.exit(1)
  }
}

start()