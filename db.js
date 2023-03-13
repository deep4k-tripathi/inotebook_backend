const mongoose=require('mongoose');

const mongoURI="mongodb+srv://Deepak:Deep%40k12345@cluster0.x12misb.mongodb.net/inotebook"
// const mongoURI=process.env.DATABASE

const connectToMongo=()=>{
    mongoose.connect(mongoURI,()=>{
        console.log("Connected to Mongo Successfully")
    })
}

module.exports=connectToMongo