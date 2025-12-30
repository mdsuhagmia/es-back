const express = require("express");
const { handleCreateCategory, handleGetCategory, handleGetSingleCategory, handleUpdateCategory, handleDeleteCategory } = require("../controller/categoryController");
const { validateCategory } = require("../validator/category");
const runValidation = require("../validator");
const { isLoggedIn, isAdmin } = require("../middlewares/auth");
const categoryRouter = express.Router();

categoryRouter.post("/", validateCategory, runValidation, isLoggedIn, isAdmin, handleCreateCategory);

categoryRouter.get("/", handleGetCategory);

categoryRouter.get("/:slug", handleGetSingleCategory);

categoryRouter.put("/:slug", validateCategory, runValidation, isLoggedIn, isAdmin, handleUpdateCategory);

categoryRouter.delete("/:slug", isLoggedIn, isAdmin, handleDeleteCategory);

module.exports = categoryRouter;