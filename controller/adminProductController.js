const Category = require("../models/categoryData");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Product = require("../models/productData");
const { filedCheker } = require("../utils/authHandler");
const path = require("path")
const imageProcessing = require("../utils/cropedImage")

const getProducts = asyncHandler(async (req, res) => {
  const messages = req.flash("error");
  const edit = req.flash("edit");
  const success = req.flash("success");

  let perpage = 10;
  let page = req.query.page || 1;

  try {
    const count = await Product.countDocuments(); // Use countDocuments() instead of count()
    const customer = await Product.aggregate([{ $sort: { updatedAt: -1 } }])
      .skip(perpage * (page - 1))
      .limit(perpage)
      .exec();

    return res.render("getProducts", {
      title: "product page",
      layout: "./layouts/main2",
      success,
      edit,
      messages,
      customer,
      current: page,
      pages: Math.ceil(count / perpage),
    });
  } catch (error) {
    console.error("Error: " + error.message);
  }
});

const addProductsGet = async (req, res) => {

  try {
    // Fetch categories from the database
    const categories = await Category.find();

    return res.status(200).render("addProducts", {
      title: "Add products",
      layout: "./layouts/main2",
      Categories: categories,
      Product: {}, // Provide an empty Product object if needed
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

const addProducts = async (req, res) => {
  console.log(req.body);

  try {
      // Validate CategoryId
      if (!req.body.CategoryId) {
          console.log("Invalid CategoryId");
          req.flash("error", 'Invalid Category');
          return res.status(400).redirect("/admin/products");
      }

      const category = await Category.findById(req.body.CategoryId);
      if (!category) {
          console.log("Invalid Category");
          req.flash("error", 'Invalid Category');
          return res.status(400).redirect("/admin/products");
      }

      const {
          name, description, richDescription, brand, price, CategoryId,
          countInStock, rating, numReviews, isFeatured
      } = req.body;

      if (!name) {
          throw new Error('Product name is required');
      }

      const files = req.files;
      if (!files || files.length === 0) {
          throw new Error('No images in the request');
      }

      const basePath = `${req.protocol}://${req.get('host')}/public/cropedImage`;
      const processedImages = await Promise.all(files.map(async (file) => {
          const inputFilePath = file.path;
          const outputFolderPath = './public/cropedImage';

          // Use imageProcessing function for image processing
          return await imageProcessing(inputFilePath, outputFolderPath);
      }));

      const newProduct = new Product({
          name,
          description,
          richDescription,
          brand,
          price,
          category: CategoryId,
          countInStock,
          rating,
          numReviews,
          isFeatured,
          images: processedImages
      });

      console.log(newProduct);

      const savedProduct = await newProduct.save();

      if (!savedProduct) {
          console.log("Product update failed");
          req.flash("error", 'Product upload failed');
          return res.status(500).redirect("/admin/products");
      }

      console.log("Product update done");
      req.flash("success", "Product upload successful");
      return res.status(200).redirect("/admin/products");
  } catch (error) {
      console.error(error);
      req.flash("error", error.message);
      return res.status(500).redirect("/admin/products");
  }
};



const getproductEdit = asyncHandler(async (req, res) => {
  try {
    const customer = await Product.findOne({ _id: req.params.id });
    const Categories = await Category.find();

    res
      .status(200)
      .render("prodectEdit", {
        title: "EditCatagory",
        layout: "./layouts/main2",
        customer,
        Categories,
        Product: {},
      });
    // res.send("haii")
  } catch (error) {
    console.log("Error:", error.message);
  }
});

const editProdect = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      richDescription,
      brand,
      price,
      CategoryId,
      countInStock,
      rating,
      numReviews,
      isFeatured,
    } = req.body;

    if (filedCheker(name)) {
      req.flash(
        "edit",
        `Unsuccessfull product adding .Give valid product name`
      );
      return res.status(400).redirect("/admin/products");
    }

    const updatedUser = {
      name,
      description,
      richDescription,
      brand,
      price,
      CategoryId,
      countInStock,
      rating,
      numReviews,
      isFeatured,
    };

    if (filedCheker(name)) {
      req.flash("edit", `Unsuccessfull product edit .Give valid product name`);
      return res.status(400).res.redirect("/admin/products");
    }

    // Use the appropriate method to update the user by ID, e.g., findOneAndUpdate or findByIdAndUpdate
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updatedUser,
      { new: true }
    );

    req.flash("edit", `Edited Category: ${updated.name}`);
    res.redirect("/admin/products?status=3");
  } catch (error) {
    console.error("Error editing user:", error.message);
    res.status(500).send("Product edit failed");
  }
});

const deleteProdect = asyncHandler(async (req, res) => {
  const product = await Product.deleteOne({ _id: req.params.id });
  req.flash("success", "category deleted");
  return res.redirect("/admin/products?status=2");
});

const searchProdect = asyncHandler(async (req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
    const customers = await Product.find({
      $or: [{ name: { $regex: new RegExp(searchNoSpecialChar, "i") } }],
    });
    return res.render("searchProduct", {
      customers,
      layout: "./layouts/main2",
      title: "",
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = {
  getProducts,
  addProductsGet,
  addProducts,
  getproductEdit,
  editProdect,
  deleteProdect,
  searchProdect,
};
