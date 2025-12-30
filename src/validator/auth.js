const { body } = require('express-validator');

// registration validation
const validateUserRegistration = [
    body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required. Enter your full name")
    .isLength({min: 3, max: 40})
    .withMessage("Name should be at least 3-40 characters long"),

    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required. Enter your email")
    .isEmail()
    .withMessage("Invalid email address"),

    body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required. Enter your password")
    .isLength({min: 6})
    .withMessage("Password should be at least 6 characters long")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,20}$/)
    .withMessage("Password should be at least one uppercase letter, one lowercase letter, one number and one spacial character."),

    body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required. Enter your address")
    .isLength({min: 3})
    .withMessage("Address should be at least 3 characters long"),

    body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required. Enter your phone number"),

    body("image")
    .optional()
    .isString()
    .withMessage("Image is required"),
]

// sign in validation
const validateUserLogin = [
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required. Enter your email")
    .isEmail()
    .withMessage("Invalid email address"),

    body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required. Enter your password")
    .isLength({min: 6})
    .withMessage("Password should be at least 6 characters long")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,20}$/)
    .withMessage("Password should be at least one uppercase letter, one lowercase letter, one number and one spacial character."),
]

// password update validation
const validateUserUpdatePassword = [
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required. Enter your email")
    .isEmail()
    .withMessage("Invalid email address"),

    body("oldPassword")
    .trim()
    .notEmpty()
    .withMessage("Old Password is required. Enter your old password")
    .isLength({min: 6})
    .withMessage("Old password should be at least 6 characters long")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,20}$/)
    .withMessage("Old password should be at least one uppercase letter, one lowercase letter, one number and one spacial character."),
    
    body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("New Password is required. Enter your New password")
    .isLength({min: 6})
    .withMessage("New password should be at least 6 characters long")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,20}$/)
    .withMessage("New password should be at least one uppercase letter, one lowercase letter, one number and one spacial character."),

    body("confirmPassword").custom((value, {req})=>{
        if(value !== req.body.newPassword){
            throw new Error("Password did not match.");
        }
        return true;
    })
]

const validateUserForgotPassword = [
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required. Enter your email")
    .isEmail()
    .withMessage("Invalid email address"),
]

const validateUserResetPassword = [
  body("token")
  .trim()
  .notEmpty()
  .withMessage("Token is required."),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 6 })
    .withMessage("Password should be at least 6 characters long")
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,20}$/
    )
    .withMessage(
      "Password should be at least one uppercase letter, one lowercase letter, one number and one spacial character."
    ),
]

module.exports = {validateUserRegistration, validateUserLogin, validateUserUpdatePassword, validateUserForgotPassword, validateUserResetPassword}