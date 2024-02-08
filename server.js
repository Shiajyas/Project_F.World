require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const session = require("express-session")
const cookie = require("cookie-parser")
const methodOverride = require("method-override")
const connectDB = require("./server/config/db")
const flash = require("connect-flash")
const path = require("path")
const expressLayouts = require("express-ejs-layouts")

connectDB()
const app = express()
const port = process.env.PORT || 5000

app.use(cookie()) 
app.use(bodyParser.urlencoded({extended: true}))
app.use(methodOverride("_method")) 
 
app.use(session({
    secret: "secret", 
    resave: false,
    saveUninitialized: true,
    cookie:{  
        maxAge: 1000*60*60*24*7 // 1 week
    }
}))
 
app.use(flash())

//serving static files
app.use("/public", express.static(path.join(__dirname, "public"))); 
app.use("/css",express.static(path.join(__dirname,"public/css")))
app.use("/pics",express.static(path.join(__dirname,"public/pics")))
app.use("/productImages",express.static(path.join(__dirname,"public/productImages")))

//settings of view engine
app.use(expressLayouts);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

app.get("/",(req,res)=>{
    res.status(200).render("homePage")
})

app.use("/user", require("./routes/authRouterUser"))
app.use("/admin", require("./routes/authRouterAdmin"))
app.use("/admin/customer", require("./routes/adminCustomerRoutes"))
app.use("/admin/categories", require("./routes/adminCategoryRoutes"))
app.use("/admin/products", require("./routes/adminProductRoutes"))

app.listen(port, ()=>console.log(`Server running on : http://localhost:${port}`))






