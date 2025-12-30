const { body } = require('express-validator');

// products validation
const validateProduct = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Product title is required.")
    .isLength({ min: 2 })
    .withMessage("Product title must be at least 2 characters long"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required.")
    .isLength({ min: 2 })
    .withMessage("Product title must be at least 2 characters long"),

  body("price")
    .trim()
    .notEmpty()
    .withMessage("Price is required.")
    .isFloat({ min: 0 })
    .withMessage("Price must be positive number."),

  body("quantity")
    .trim()
    .notEmpty()
    .withMessage("Qunatity is required.")
    .isInt({ min: 1 })
    .withMessage("Price must be positive integer."),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required."),

  body("image")
    .optional()
    .isString()
    .withMessage("Product image is optional"),
];

module.exports = {validateProduct}