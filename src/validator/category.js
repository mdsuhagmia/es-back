const { body } = require('express-validator');

// category validation
const validateCategory = [
    body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required."),
]

module.exports = {validateCategory}