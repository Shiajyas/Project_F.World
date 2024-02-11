const Admin = require("../models/adminData")
const {validatingRules,signToken} = require("../utils/authHandler")
const asyncHandler = require("express-async-handler")
const { validationResult } = require("express-validator")
const jwt = require("jsonwebtoken")
const util = require("util");
const { error, log } = require('console');

const adminSignupPost = [
    validatingRules,
    asyncHandler(async (req, res) => {
      const errors = validationResult(req);
  
      if (!errors.isEmpty()) {
      
        return res.status(401).json({status:"fail",message:err})
      } else {
        const { name, email, password, confirmPassword } = req.body;
        
        try {
          const newAdmin = await Admin.create({ name, email, password, confirmPassword });
          const token = signToken(newAdmin._id);
  
          console.log(newAdmin); 
          console.log(token);
          return res.status(200).json({status:"success",message:"signup successfull"});
        } catch (error) {
          console.error(error);
  
          if (error.name === 'ValidationError' && error.errors.email.kind === 'unique') {
            return res.status(500).json({status:"faild",message:"Server error"})
          } else {
            return res.status(401).json({status:"faild",message:"Email id already registerd"})
          }
        }
      }
    })
  ];

  
const adminLoginPost = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
     
      return res.status(400).render("adminlogin", { errorMsg: "Please provide email and password" });
    }
  
    try {
      const newUser = await Admin.findOne({ email }).select("+password");
  
      if (!newUser) {
        return res.status(401).render("adminLogin", { errorMsg: "Invalid email or password" });
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
        
        return res.redirect("/admin/dashbord"); // Redirect to dashboard after setting the cookie
      } else {
        console.log("fail");
        return res.status(401).render("adminLogin", { errorMsg: "Invalid email or password" });
      }
    } catch (err) {
      console.error(err.message);
      if (err.name === "ServerError") {
        return res.status(500).render("adminLogin", { errorMsg: "Server error. Please try again later." });
      } else {
        return res.status(500).render("adminLogin", { errorMsg: "Something went wrong. Please try again." });
      }
    }
  });

  
// Protect middleware
const adminProtectRules = asyncHandler(async (req, res, next) => {
    try {
      let token = req.query.token || req.cookies.token || req.headers.authorization;
  
      if (!token) {
        req.flash("error","Unauthorized access")
        return res.status(401).redirect("/admin/login");
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
      const admin = await Admin.findById(decodeToken.id);
  
      if (!admin) {
        req.flash("error","your profile not exit create new one!!")
        return res.status(404).redirect("/admin/login");
      }
  
      // Check if the user changed the password after the token was issued
      if (admin.isPasswordChanged(decodeToken.iat)) {
        req.flash("error","The password was changed recently. Please try again later.")
        return res.status(401).redirect("/admin/login");
      }
  
      // Proceed to the next middleware
      req.admin = admin
      req.token = token; // Optional: Save the token in the request object for later use
      next();
    } catch (error) {
      // Handle specific error scenarios with appropriate responses
      if (error.name === "JsonWebTokenError") {
        req.flash("error","your profile not valid, create new one")
        return res.status(401).redirect("/admin/login");
      } else if (error.name === "TokenExpiredError") {
        req.flash("error","your profile not valid, create new one")
        return res.status(401).redirect("/admin/login");
      } else {
        console.error(error.message);
        req.flash("error","your profile not valid, create new one")
        return res.status(500).redirect("/admin/login");
      }
    }
  });
  
  // add seprate permission to access admin and user
  
  const adminRestrict = (...role)=>{
    return (req,res,next)=>{
  
      if(!role.includes(req.admin.role)){
        
        req.flash("error","your profile not valid, create new one")
        return res.status(500).redirect("/admin/login");
      }
      next ()
    }
  }
  

  const adminLogin = (req,res)=>{
   const errorMsg = req.flash("error")
    return res.status(200).render("adminLogin",{errorMsg})
  }

  const adminDashbord = (req,res)=>{

    return res.status(200).render("adminDahbord",{title: "about page",layout: "./layouts/main2"}) 
  }
  
  const adminLogout = (req,res)=>{
    res.cookie("token", "", {maxAge:1})
    return res.render("adminLogin",{errorMsg:"Logout SuccessFul"})
  }

  module.exports = {
    adminLogin,
    adminSignupPost,
    adminLoginPost,
    adminDashbord,
    adminProtectRules,
    adminRestrict,
    adminLogout
  }