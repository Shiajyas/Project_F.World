const User = require('../models/UserDB');
const {validatingRules,signToken, filedCheker}= require("../utils/authHandler")
const asyncHandler = require('express-async-handler');
const {  validationResult } = require('express-validator');
const jwt = require("jsonwebtoken")
const util = require("util");
const { use } = require('../routes/authRouterUser');
const { error, log } = require('console'); 
const sendEmail = require("../Utils/email")
const bcrypt = require("bcryptjs");



// Handle user signup POST request

const userSignupPost = [
  validatingRules,
  asyncHandler(async (req, res) => {
 
  
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorArray = errors.array().map((err) => err.msg);
    
      return res.status(401).render('signup', { error: errorArray, successMsg: '' });
    } else {
      const { name, email, password, confirmPassword } = req.body;
      
  if(filedCheker(name)){
    return res.status(400).render("signup", { error: ["Please provide a valid Name"], successMsg: "" });
  }
      try {
        const newUser = await User.create({ name, email, password, confirmPassword });
        const token = signToken(newUser._id);
        const tokenWithBearer = `Bearer ${token}`

        console.log(newUser); 
        console.log(token);
        return res.status(200).render('signup', { successMsg: 'Signup successful', error: [] });
      } catch (error) {
        console.error(error);

        if (error.name === 'ValidationError' && error.errors.email.kind === 'unique') {
          return res.status(500).render('signup', { error: ['Oops! Something went wrong.'], successMsg: '' });
        } else {
          return res.status(401).render('signup', { error: ['Email already registered'], successMsg: '' });
        }
      }
    }
  })
];

const userLoginPost = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
 
  if (!email || !password) {
   
    return res.status(400).render("userlogin", { errorMsg: "Please provide email and password" });
  }

  try {
    const newUser = await User.findOne({ email }).select("+password");

    if (!newUser) {
      return res.status(401).render("userlogin", { errorMsg: "Invalid email or password" });
    }
    const isPasswordMatch = await newUser.comparePassword(password);

    if (isPasswordMatch) {
      console.log("success");
      const token = signToken(newUser._id);
    
      // Set token as a cookie with options (e.g., secure, httpOnly, sameSite)
      res.cookie('token', token, {
        httpOnly: true, // Cookie accessible only by the web server
        secure: true, // Enable only in HTTPS mode
        sameSite: 'strict', // Restrict cookie sending to same-site requests
        // Add other necessary cookie options
      });
    
      return res.redirect("/user/dashbord"); // Redirect to dashboard after setting the cookie
    } else {
      console.log("fail");
      return res.status(401).render("userlogin", { errorMsg: "Invalid email or password" });
    }
  } catch (err) {
    console.error(err.message);
    if (err.name === "ServerError") {
      return res.status(500).render("userlogin", { errorMsg: "Server error. Please try again later." });
    } else {
      return res.status(500).render("userlogin", { errorMsg: "Something went wrong. Please try again." });
    }
  }
});


// Protect middleware
const protectRules = asyncHandler(async (req, res, next) => {
  try {
    let token = req.query.token || req.cookies.token || req.headers.authorization;

    if (!token) {
      req.flash("error","Unauthorized access")
      return res.status(401).redirect("/user_login");
    }

    // Log the token for inspection

    // Check if the token is in the format 'Bearer <token>'
    if (!token.startsWith("Bearer")) {
      // If the token doesn't have the 'Bearer' prefix, prepend it
      token = `Bearer ${token}`;
    }

    // Extract the token part after 'Bearer '
    token = token.slice(7); // Remove 'Bearer ' to get only the token part

    // Validate token
    const decodeToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR);
    console.log(decodeToken);

    // Verify user existence based on the decoded token
    const user = await User.findById(decodeToken.id);

    if (!user) {
      req.flash("error","your profile not exit create new one!!")
      return res.status(404).redirect("/user_login");
    }

    // Check if the user changed the password after the token was issued
    if (user.isPasswordChanged(decodeToken.iat)) {
      req.flash("error","The password was changed recently. Please try again later.")
      return res.status(401).redirect("/user_login");
    }

    // Proceed to the next middleware
    req.user = user
    req.token = token; // Optional: Save the token in the request object for later use
    next();
  } catch (error) {
    // Handle specific error scenarios with appropriate responses
    if (error.name === "JsonWebTokenError") {
      req.flash("error","your profile not valid, create new one")
      return res.status(401).redirect("/user_login");
    } else if (error.name === "TokenExpiredError") {
      req.flash("error","your profile not valid, create new one")
      return res.status(401).redirect("/user_login");
    } else {
      console.error(error.message);
      req.flash("error","your profile not valid, create new one")
      return res.status(500).redirect("/user_login");
    }
  }
});

// add seprate permission to access admin and user

const restrict = (...role)=>{
  return (req,res,next)=>{

    if(!role.includes(req.user.role)){
      
      req.flash("error","your profile not valid, create new one")
      return res.status(500).redirect("/user_login");
    }
    next ()
  }
}

const resetPasswordPost = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      otpExpires: { $gt: Date.now() },
    });

    const {password,confirmPassword} = req.body

    if(password !== confirmPassword){

      return res.status(401).render("restPwdForm",{success:"Passeord donsn't match"})
    }

    console.log(user);

    if (!user) {

      return res.status(400).render("restPwdForm",{success:"Invalid OTP or OTP has expired" })
    }

    const isMatch = await bcrypt.compare(req.body.otp, user.encryptedOTP);

    if (!isMatch) {
      return res.status(400).render("restPwdForm",{success:"Invalid OTP or OTP has expired" })
    }

    // Reset user password and other necessary fields
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.encryptedOTPotp = undefined;
    user.otpExpires = undefined;
    user.passwordChangedAt = Date.now();

    await user.save();
    req.flash("error","Password successfully updated")
    return res.redirect("/user_login");
  } catch (error) {
    console.error(error);
    return res.status(500).render("restPwdForm",{success:"Server error. Unable to reset password"  })
  }
});

const resetPassword = async(req,res)=>{
   const success = await req.flash("success")
  return  res.status(200).render("restPwdForm",{success})
}

// forgetPassword Post route
const forgetPasswordPost = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      req.flash("error", "This email is not registered");
      return res.status(401).redirect("/user/forgetPassword");
    }

    const otp = user.otpGenerator();
    console.log(otp);

    await user.save({ validateBeforeSave: false });

    // Prepare and send email with the OTP
    const message = `We have received a password reset request. Your OTP is: ${otp}`;
    await sendEmail({
      email: user.email,
      subject: "Password Reset OTP",
      message: message,
    });

    req.flash("success", "OTP sent to your email.");
    return res.status(200).redirect("/user/resetPassword");
  } catch (error) {
    console.error(error);
    req.flash("error", "Server error. Unable to generate OTP");
    return res.status(500).redirect("/user/forgetPassword");
  }
});

// forgetPassword route
const forgetPassword = (req, res) => {
  const errorMsg = req.flash("error")
  return res.status(200).render("recoverPwd", { errorMsg});
};

//render dashbord
const userdashbord = (req,res)=>{

  return res.status(200).render("userdashbord")
}


// Render user login page
const userLogin = (req, res) => {
  const errorMsg = req.flash("error")
 return res.render('userlogin', { errorMsg, successMsg: '' });
};

// Render signup page
const userSignup = (req, res) => {
 return res.render("signup", { successMsg: "", error: [] });
};





module.exports = {
  userLogin,
  userSignup,
  userSignupPost, 
  userLoginPost,
  userdashbord,
  protectRules,
  restrict,
  forgetPassword,
  forgetPasswordPost,
  resetPassword,
  resetPasswordPost
};
