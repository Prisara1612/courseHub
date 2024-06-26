const User=require('../models/user');
const OTP= require('../models/OTP')
const otpGenerator=require('otp-generator')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
require("dotenv").config();
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");


//otp:-

exports.sendOTP = async(req,res)=>{
  
    try{
         
        const {email}=req.body;
        
        if (!email) {
          return res.status(400).json({
            success: false,
            message: "Email is required",
          });
        }
    
    
        const checkUserPresent=await User.findOne({email});

        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"user already exists",
            })
        }

      var otp=otpGenerator.generate(6,{
         upperCaseAlphabets:false,
         lowerCaseAlphabets:false,
         specialChars:false,
      });
      console.log("OTP generated:",otp);


      let result=await OTP.findOne({otp:otp});

      console.log(result);

      while(result){
        otp=otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,

        });
        result=await OTP.findOne({otp:otp});
      }

      const otpPayload={email,otp};
      const otpBody=await OTP.create(otpPayload);
      console.log(otpBody);
     
       

     res.status(200).json({
        success:true,
        message:'OTP sent Successfully',
        otp,
     })


    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }



};

//signup:-

exports.signUp=async (req,res)=>{
  //data fetch
  try{
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    accountType,
    contactNumber,
    otp
      }=req.body;
  //validate
  if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
    return res.status(403).json({
        success:false,
        message:"all fields are required"
    })
  }
  //password match
  if(password !== confirmPassword){
    return res.status(400).json({
        success:false,
        message:'Password and confirmPassword not matching'
    })
  }
  //check user exist or not
  const existingUser=await User.findOne({email});
  console.log(existingUser);
  if(existingUser){
    return res.status(400).json({
        success:false,
        message:'user is already registered',
    })
  }
  
  //find most recent otp stored for user
  const recentOtp=await OTP.find({email}).sort({createdAt:-1}).limit(1);
  console.log("recentotp",recentOtp) ;
  //validate otp
  if(recentOtp.length==0){
    return res.status(400).json({
        success:false,
        message:'OTP not found',
    })
  }
  else if(otp !==recentOtp[0].otp){
     return res.status(400).json({
        success:false,
        message:"Invalid OTP"
     })
  }
  
  //hash password
 const hashedPassword=await bcrypt.hash(password,10);

 let approved = ""
    approved === "Instructor" ? (approved = false) : (approved = true)
  //entry create in database
  const profileDetails=await Profile.create({
    gender:null,
    dateOfBirth:null,
    about:null,
    contactNumber:null,
  });
  const user=await User.create({
    firstName,
    lastName,
    email,
    contactNumber,
    password: hashedPassword,
    accountType: accountType,
    approved: approved,
    additionalDetails: profileDetails._id,
    image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,

  })
  return res.status(200).json({
    success:true,
    message:'user is registered successfully',
    user,
  })

  }
 catch(error){
    console.log("error in user registering",error);
    return res.status(500).json({
        success:false,
        message:"user cannot be registered.Please try again"
    })
 }

  }

  //login:-
  exports.login=async(req,res)=>{
   try{
      //get data from req  body
      const {email,password}=req.body;
      //validation data
      if(!email || !password){
        return res.status(403).json({
            success:false,
            message:'All fields are required,please try again'
        });
      }
      
      //user check exist or not
      const user=await User.findOne({email}).populate("additionalDetails");
      if(!user){
        return res.status(401).json({
            success:false,
            message:'user is not registered,Please signup first...'
        })
      }
      //genertare jwt,after password matching
      if(await bcrypt.compare(password,user.password)){
        const payload={
          email:user.email,
          id:user._id,
          accountType:user.accountType,
        }
        const token=jwt.sign(payload,process.env.JWT_SECRET,{
            expiresIn:"2h",
        });
        user.token=token;
        user.password=undefined;
      
      //create coookie and send response
      const options={
        expires:new Date(Date.now()+3*24*60*60*1000),
        httpOnly:true,
      }
      res.cookie("token",token,options).status(200).json({
        success:true,
        token,
        user,
        message:'Logged in successfully',
      })
    }
    else{
        return res.status(401).json({
            success:false,
            message:'Password is incorrect'
        })
    }
   }
   catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:'login Failure please try again...'

    })
   }

  }

  //changePassword
  exports.changePassword = async (req, res) => {
    try {
        // Get data from req body
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New password and confirm password do not match' });
        }

        // Find user in the database (assuming the user is authenticated and their ID is in req.user)
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the old password is correct
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        // Update password in database
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        // Send mail - Password updated
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Example using Gmail
            auth: {
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
        });

        const mailOptions = {
            from:'CourseHub||Student-by Prince',
            to: user.email,
            subject: 'Password Updated',
            text: 'Your password has been successfully updated.'
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending email' });
            }
            console.log('Email sent:', info.response);
        });

        // Return response
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};