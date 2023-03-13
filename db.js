const mongoose=require('mongoose');
const config = require('./config');

// const mongoURI="mongodb+srv://Deepak:Deep%40k12345@cluster0.x12misb.mongodb.net/inotebook"
const mongoURI=process.env.MONGODB_URL

const connectToMongo=()=>{
    mongoose.connect(mongoURI,()=>{
        console.log("Connected to Mongo Successfully")
    })
}

module.exports=connectToMongo