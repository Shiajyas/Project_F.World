const express = require("express")
const authRouterAdmin = express.Router()

const {
    adminLogin,
    adminSignupPost,
    adminLoginPost,
    adminDashbord,
    adminProtectRules,
    adminRestrict
  } = require("../controller/adminAuthController")

authRouterAdmin.get("/login",adminLogin)
authRouterAdmin.post("/login",adminLoginPost)
authRouterAdmin.post("/sign",adminSignupPost)
authRouterAdmin.get("/dashbord",adminProtectRules,adminRestrict("admin"),adminDashbord)

module.exports = authRouterAdmin


