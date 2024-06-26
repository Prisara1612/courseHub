const mongoose=require('mongoose')


const Schema=mongoose.Schema

const userSchema=new Schema({
  firstName:{
    type:String,
    required:true,
    trim:true,
  },
  lastName:{
    type:String,
    required:true,
    trim:true,
  },
  email:{
    type:String,
    required:true,
    trim:true,
    unique: true,
  },
  password:{
    type:String,
    required:true,
    
  },
  accountType:{
    type:String,
    enum:["Admin","Student","Instructor"],
    required:true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  approved: {
    type: Boolean,
    default: true,
  },
  additionalDetails:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"profile",
  },
  courses:[{
   type:mongoose.Schema.Types.ObjectId,
   ref:"Course",
  }],
  images:{
    type:String,
    // required:true,
  },
  token:{
    type:String,
  },
  resetPasswordExpires:{
    type:Date,
  },
  courseProgrees:[
    {
  type:mongoose.Schema.Types.ObjectId, 
  ref:"CourseProgress"
    }
  ],

},
{timestamps:true}
);

const user =mongoose.model("user",userSchema);

module.exports=user