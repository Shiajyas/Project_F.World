const express = require("express")
const productsRoutes = express.Router()

const {
    productDetail
} = require("../controller/productController")


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
    userLogout
  } = require("../controller/userAuthController")

  productsRoutes.get("/:id", protectRules, restrict("user"),productDetail); 




module.exports = productsRoutes