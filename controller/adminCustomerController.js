const User = require('../models/UserDB');
const asyncHandler = require("express-async-handler")
const mongoose = require("mongoose");
const {filedCheker} = require("../utils/authHandler")

const customerPage = asyncHandler(async (req, res) => {
    const message = req.flash("info");
    const messages = req.flash("warning")
    const edit = req.flash("edit")
  
    let perpage = 3;
    let page = req.query.page || 1;

    try {
        const count = await User.countDocuments(); // Use countDocuments() instead of count()
        const customer = await User.aggregate([
            { $sort: { updatedAt: -1 } }
        ])
        .skip(perpage * (page - 1))
        .limit(perpage)
        .exec();

        return res.render("custmerPanel", {
            title: "about page",
            layout: "./layouts/main2",
            message,
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




const addUser = asyncHandler(async (req, res) => {
    return res.status(200).render("userAdd",{title: "about page",layout: "./layouts/main2"})
});

const postUser = asyncHandler(async (req, res) => {
    console.log(req.body);
    const {name,
      contact,
      email,
      district,
      state,
      pincode,
      country,
      dob,
      status,
      days, 
      adreess } = req.body;

      

    try {
        const newUser = await User.create({
            name,
            contact,
            email,
            district,
            state,
            pincode,
            country,
            dob,
            status,
            days, 
            adreess
        });
         req.flash("info","New use is added")
        console.log("data uploaded");
        res.redirect("/admin/customer?status=1")
    } catch (error) {
        console.error("User creation failed:", error.message);
      
        res.status(500).send("User creation failed");
    }
});

const getView = asyncHandler(async(req,res)=>{
try {
    const customer = await User.findOne({_id:req.params.id})

    res.render("userView",{title: "about page",layout: "./layouts/main2",customer})
    // res.send("haii")
} catch (error) {
    console.log("Error:",error.message);
}
})

const getEdit = asyncHandler(async(req,res)=>{
    try {
        const customer = await User.findOne({_id:req.params.id})
     return   res.render("userEdit",{title: "about page",layout: "./layouts/main2",customer})
        // res.send("haii")
    } catch (error) {
        console.log("Error:",error.message);
    }
    })


    const deleteUser = asyncHandler(async(req,res)=>{
        const  customer = await User.deleteOne({_id:req.params.id})
        req.flash("warning","user deleted")
        res.redirect('/admin/customer?status=2')

    })


    const editUser = async (req, res) => {
      try {
        const updatedUser = {
          name: req.body.name,
          email: req.body.email,
          contact: req.body.contact,
          status: req.body.status,
          days: req.body.days,
          address: req.body.address,
          updatedAt: Date.now(),
        };
        if(filedCheker(name)){
          req.flash("edit", `User editing is not done,Give vallid userName`);
          return res.status(400).redirect("/admin/customer?status=3");
        }
// Use the appropriate method to update the user by ID, e.g., findOneAndUpdate or findByIdAndUpdate
        const updated = await User.findByIdAndUpdate(req.params.id, updatedUser, { new: true });
     
        if (!updated) {
          
          // Handle case where user with that ID doesn't exist
          return res.status(404).send('User not found');
        }
      console.log('1');
        req.flash("edit", `Edited user: ${updated.name}`);
        res.redirect("/admin/customer?status=3");
      } catch (error) {
        console.error("Error editing user:", error.message); 
        req.flash("edit", `User editing is not done,give vallid userName`);
        res.status(401).redirect("/admin/customer?status=3");
      }
    };

      const searchUser = asyncHandler( async (req, res) => {

      
        try {
          let searchTerm = req.body.searchTerm;
          const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
      
          const customers = await User.find({
            $or: [
              { name: { $regex: new RegExp(searchNoSpecialChar, "i") }},
             
            ]
          });
      
        return  res.render("searchUser", {
            customers
            ,layout:"./layouts/main2",
            title: ''
          })
          
        } catch (error) {
          console.log(error);
        }
      
      })

   

module.exports = {
    customerPage,
    addUser,
    postUser,
    getView,
    getEdit,
    editUser,
    deleteUser,
    searchUser
};




