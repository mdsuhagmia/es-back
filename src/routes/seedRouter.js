const express = require("express");
const { getSeedController, getProductsController } = require("../controller/seedController");
const seedRouter = express.Router();

seedRouter.get("/users", getSeedController);
seedRouter.get("/products", getProductsController);

module.exports = seedRouter;