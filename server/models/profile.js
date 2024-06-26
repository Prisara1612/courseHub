const mongoose=require('mongoose')

const profileSchema=new mongoose.Schema({
  gender:{
    type:String,
  },
  dateOfBirth:{
    type:String,
  },
  about:{
    type:String,
    trim:true,
  },
  contactNumber:{
   type:Number,
   trim:true,
  }

})
const Profile=mongoose.model("profile",profileSchema);
module.exports=Profile

// hello