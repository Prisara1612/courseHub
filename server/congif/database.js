const mongoose=require("mongoose");
require("dotenv").config();
exports.connect =()=>{
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    })
    .then(()=>{
        console.log("database connected sucessfully...")
    })
    .catch((error)=>{
        console.log("error is",error);
        process.exit(1);
    })

}