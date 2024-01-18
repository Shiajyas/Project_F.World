const express = require("express")
const authRouterUser = express.Router()

const {
  userSignup,
  userSignupPost,
  userLogin,
  userLoginPost,
  protectRules,
  userdashbord,
  forgetPassword,
  restrict,
  forgetPasswordPost,
  resetPassword,
  resetPasswordPost,
} = require("../controller/userAuthController")

authRouterUser.get('/signup',userSignup); // GET request to render the signup form
authRouterUser.post('/signup', userSignupPost); // POST request to handle form submission
authRouterUser.get('/login', userLogin); // Example route for user login
authRouterUser.post('/login',userLoginPost)
authRouterUser.get("/dashbord",protectRules,restrict("user","admin"),userdashbord) 
authRouterUser.get("/forgetPassword",forgetPassword)
authRouterUser.post("/forgetPassword",forgetPasswordPost)
authRouterUser.post("/resetPassword",resetPasswordPost)
authRouterUser.get("/resetPassword",resetPassword)



module.exports = authRouterUser;



