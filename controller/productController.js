const Products = require("../models/productData")
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose")

const productDetail = asyncHandler(async (req, res) => {
    try {
        // Fetch the product data from the database based on the productId
       
        const product = await Products.findById({ _id: req.params.id });

        // Check if the product exists
        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Render the productDetail view and pass the product data
        res.render('productDetail', { product ,layout: "./layouts/main3", title: "Product Detail"});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = {
    productDetail
}