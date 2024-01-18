const express = require("express")
const adminCustomerRoutes = express.Router()


const {
    customerPage ,
      addUser,
      postUser,
      getView,
      getEdit,
      editUser,
      deleteUser,
      searchUser
  } =require("../controller/adminCustomerController");

  
const {
    adminProtectRules,
    adminRestrict
  } = require("../controller/adminAuthController")

   
adminCustomerRoutes.get("/",adminProtectRules,adminRestrict("admin"),customerPage)
adminCustomerRoutes.get("/add",adminProtectRules,adminRestrict("admin"),addUser)
adminCustomerRoutes.post("/add",adminProtectRules,adminRestrict("admin"),postUser)
adminCustomerRoutes.get("/view/:id",adminProtectRules,adminRestrict("admin"),getView)
adminCustomerRoutes.get("/edit/:id",adminProtectRules,adminRestrict("admin"),getEdit)
adminCustomerRoutes.delete("/edit/:id",adminProtectRules,adminRestrict("admin"),deleteUser)
adminCustomerRoutes.put("/edit/:id",adminProtectRules,adminRestrict("admin"),editUser);
adminCustomerRoutes.post("/search",adminProtectRules,adminRestrict("admin"),searchUser)

module.exports = adminCustomerRoutes;