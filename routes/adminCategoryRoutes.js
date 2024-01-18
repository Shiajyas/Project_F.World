const express = require("express")
const adminCategoryRoutes = express.Router()
const upload = require("../utils/imageUploader")

const  { 
    getCategory,
    viewCategory,
    listCategory,
    deleteCategory,
    editCategory,
    getEditCategory,
    searchCategory,
    } = require("../controller/adminCategoryController")

    const {
        adminProtectRules,
        adminRestrict
      } = require("../controller/adminAuthController")

adminCategoryRoutes.get("/view",adminProtectRules,adminRestrict("admin"),listCategory) 
adminCategoryRoutes.get("/add",adminProtectRules,adminRestrict("admin"),viewCategory)
adminCategoryRoutes.post("/add",adminProtectRules,adminRestrict("admin"),upload.single("image"),getCategory) 
adminCategoryRoutes.get("/edit/:id",adminProtectRules,adminRestrict("admin"),getEditCategory)
adminCategoryRoutes.delete("/edit/:id",adminProtectRules,adminRestrict("admin"),deleteCategory)
adminCategoryRoutes.put("/edit/:id",adminProtectRules,adminRestrict("admin"),editCategory) 
adminCategoryRoutes.get("/edit/:id",adminProtectRules,adminRestrict("admin"),getEditCategory)
adminCategoryRoutes.post("/search",adminProtectRules,adminRestrict("admin"),searchCategory)

module.exports = adminCategoryRoutes;