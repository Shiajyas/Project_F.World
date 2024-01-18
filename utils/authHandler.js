
const { body, validationResult } = require('express-validator');
const jwt = require("jsonwebtoken")

// Validation rules for user signup
const validatingRules = [
    body("email").isEmail().withMessage("Invalid email"),
     body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one digit'),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  
  ];

  const signToken = id =>{
    return jwt.sign({id},process.env.SECRET_STR,{  //Payload and Secrect string
      expiresIn: process.env.LOGIN_EXPIRES
    })
  }

  
// validation.js

function filedCheker(value) {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
}


  module.exports ={ validatingRules, signToken, filedCheker }

// add seprate permission to access admin and user
  // const restrict = (role)=>{
//   return (req,res,next)=>{
//     if(req.user.role !== role){
//       console.log(req.user.role);
//       throw new error("No permission to access")
//     }
//     next()
//   }
// }