const express = require("express")
const authRouterAdmin = express.Router()

const {
    adminLogin,
    adminSignupPost,
    adminLoginPost,
    adminDashbord,
    adminProtectRules,
    adminRestrict,
    adminLogout
  } = require("../controller/adminAuthController")

authRouterAdmin.get("/login",adminLogin)
authRouterAdmin.post("/login",adminLoginPost)
authRouterAdmin.post("/sign",adminSignupPost)
authRouterAdmin.get("/dashbord",adminProtectRules,adminRestrict("admin"),adminDashbord)
authRouterAdmin.get("/logout",adminProtectRules,adminRestrict("admin"),adminLogout)

module.exports = authRouterAdmin


