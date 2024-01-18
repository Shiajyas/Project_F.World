const express = require("express")
const adminProductRoutes = express.Router()
const upload = require("../utils/imageUploader")

const  { 
    getProducts,
    addProductsGet,
    addProducts,
    getproductEdit,
    editProdect,
    deleteProdect,
    searchProdect,
    } = require("../controller/adminProductController")

    
    const {
        adminProtectRules,
        adminRestrict
      } = require("../controller/adminAuthController")

      
adminProductRoutes.get("/",adminProtectRules,adminRestrict("admin"),getProducts)
adminProductRoutes.get("/add",adminProtectRules,adminRestrict("admin"),addProductsGet)
adminProductRoutes.post("/add",adminProtectRules,adminRestrict("admin"),upload.single("image"),addProducts)
adminProductRoutes.get("/edit/:id",adminProtectRules,adminRestrict("admin"),getproductEdit)
adminProductRoutes.put("/edit/:id",adminProtectRules,adminRestrict("admin"),editProdect) 
adminProductRoutes.delete("/edit/:id",adminProtectRules,adminRestrict("admin"),deleteProdect)
adminProductRoutes.post("/search",adminProtectRules,adminRestrict("admin"),searchProdect)

module.exports = adminProductRoutes