const express = require("express");
const productRouter = express.Router();

const { handleCreateProduct, handleGetProduct, handleGetSingleProduct, handleUpdateProduct, handleDeleteProduct } = require("../controller/productController");
const { validateProduct } = require("../validator/product");
const runValidation = require("../validator");
const { isLoggedIn, isAdmin } = require("../middlewares/auth");
const { uploadProductImage } = require("../middlewares/uploadFile");

productRouter.post(
  "/",
  uploadProductImage.single("image"),
  validateProduct,
  runValidation,
  isLoggedIn,
  isAdmin,
  handleCreateProduct
);

productRouter.get(
  "/",
  handleGetProduct
);

productRouter.get(
  "/:slug",
  handleGetSingleProduct
);

productRouter.put(
  "/:slug",
  uploadProductImage.single("image"),
  isLoggedIn,
  isAdmin,
  handleUpdateProduct
);

productRouter.delete(
  "/:slug",
  isLoggedIn,
  isAdmin,
  handleDeleteProduct
);

module.exports = productRouter;
