const Category = require('../models/categoryData');
const asyncHandler = require("express-async-handler")
const mongoose = require("mongoose");
const Product = require("../models/productData")
const {filedCheker} = require("../utils/authHandler")
const fs = require("fs")
const path = require("path")
const imageProcessing = require("../utils/cropedImage")

const viewCategory = async (req, res) => {
    const success = req.flash('success');
    const error = req.flash('error');
    return res.status(200).render("categoryAdd", { title: "category Add", layout: "./layouts/main2", success, error });
};
const getCategory = async (req, res) => {
  const name = req.body.name;

  // Check for a valid category name
  if (filedCheker(name)) {
    req.flash("edit", `Unsuccessful Add category. Please provide a valid category name.`);
    return res.status(400).redirect("/admin/categories/view?status=3");
  }

  // Assuming the file upload middleware (like Multer) is handling the file(s) and adding it/them to req.file or req.files
  const files = Array.isArray(req.files) ? req.files : [req.file];

  if (!files || files.length === 0) {
    req.flash("edit", `Unsuccessful Add category. No image in the request.`);
    return res.status(400).redirect("/admin/categories/view?status=3");
  }

  try {
    const processedImages = await Promise.all(
      files.map(async (file) => {
        const inputFilePath = file.path;
        console.log(inputFilePath);
        const outputFolderPath = './public/cropedImage';

        try {
          // Use imageProcessing function for image processing
          return await imageProcessing(inputFilePath, outputFolderPath);
        } catch (error) {
          console.error(`Error processing image: ${error.message}`);
          throw new Error(`Failed to process image: ${error.message}`);
        }
      })
    );

    const newCategory = new Category({ name, image: processedImages });
    const savedCategory = await newCategory.save();

    req.flash('success', `Category "${name}" added successfully`);
    res.redirect('/admin/categories/view');
  } catch (err) {
    console.error(`Error adding category: ${err.message}`);
    req.flash('error', `Failed to add category: ${err.message}`);
    res.redirect('/admin/categories/add');
  }
};



const listCategory = asyncHandler(async (req, res) => {

    const messages = req.flash("warning")
    const edit = req.flash("edit")
    const success = req.flash('success');

    let perpage = 3;
    let page = req.query.page || 1;

    try {
        const count = await Category.countDocuments(); // Use countDocuments() instead of count()
        const customer = await Category.aggregate([
            { $sort: { updatedAt: -1 } }
        ])
        .skip(perpage * (page - 1))
        .limit(perpage)
        .exec();

        return res.render("categoryList", {
            title: "category list",
            layout: "./layouts/main2",
           success,
            edit,
            messages,
            customer,
            current: page,
            pages: Math.ceil(count / perpage)
        });
    } catch (error) {
        console.error("Error: " + error.message);
    }
})

const deleteCategory = asyncHandler(async (req, res) => {
  try {
    // Find the category by ID
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      req.flash("error", "Category not found");
      return res.redirect("/admin/categories/view?status=2");
    }

    // Delete the associated image
    const filename = category.image; // Assuming the field is 'images' (plural) as suggested in the previous discussion

    if (filename && filename.length > 0) {
      try {
        // Construct the full path to the first image file
        const firstImagePath = path.join(__dirname, '..', '.', filename[0].replace(/\\/g, '/'));
        console.log(`Deleted image path is: ${firstImagePath}`);
        // Delete the first image file
        fs.unlinkSync(firstImagePath);

        req.flash("success", "Category and associated image deleted");
        return res.redirect('/admin/categories/view?status=2');
      } catch (error) {
        console.error(`Error deleting image: ${error.message}`);
        req.flash("error", "Error deleting associated image");
        return res.redirect('/admin/categories/view?status=2');
      }
    } else {
      req.flash("success", "Category deleted");
      return res.redirect('/admin/categories/view?status=2');
    }
  } catch (error) {
    console.error(`Error deleting category: ${error.message}`);
    req.flash("error", "Error deleting category");
    return res.redirect('/admin/categories/view?status=2');
  }
});



    const editCategory = asyncHandler(async (req, res) => {
      try {
        const file = req.file;
      if (!file) {
          throw new Error('No image in the request');
      }
      const fileName = file.filename;
      const basePath = `./public/productImages`;

        const updatedUser = {
          name: req.body.name,
          image: `${basePath}/${fileName}`,
        
          updatedAt: Date.now(),
        };

        if(filedCheker(updatedUser.name)){
          req.flash("edit", `Unsuccessfull editing.Give valid category name`);
          return res.status(400).redirect("/admin/categories/view?status=3");
        }

 // Use the appropriate method to update the user by ID, e.g., findOneAndUpdate or findByIdAndUpdate
        const updated = await Category.findByIdAndUpdate(req.params.id, updatedUser, { new: true });
        
        if (!updated) {
          // Handle case where user with that ID doesn't exist
          req.flash("edit", `Unsuccessfull editing.Product Not found`);
          return res.status(404).res.redirect("/admin/categories/view?status=3");
        }
     
        req.flash("edit", `Edited Category: ${updated.name}`);
        res.status(200).redirect("/admin/categories/view?status=3");
      } catch (error) {
        console.error("Error editing user:", error.message);
        res.status(500).send("User edit failed");
      }
})


const getEditCategory = asyncHandler(async(req, res) => {
    try {
        const customer = await Category.findOne({ _id: req.params.id });
        res.status(200).render("categoryEdit", { title: "Edit Category", layout: "./layouts/main2", customer });
    } catch (error) {
        console.log("Error:", error.message);
    }
});



const searchCategory = asyncHandler( async (req, res) => {

      
    try {
      let searchTerm = req.body.searchTerm;
      const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
  
      const customers = await Category.find({
        $or: [
          { name: { $regex: new RegExp(searchNoSpecialChar, "i") }},
         
        ]
      });
  
    return  res.render("searchCategory", {
        customers
        ,layout:"./layouts/main2",
        title: ''
      })
      
    } catch (error) {
      console.log(error);
    }
  
  }) 

  module.exports = { 
getCategory,
viewCategory,
listCategory,
deleteCategory,
editCategory,
getEditCategory,
searchCategory,
}