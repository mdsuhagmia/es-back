const slugify = require('slugify')
const createError = require('http-errors');
const { successResponse } = require("./errorController");
const { createCategory, getCategories, getSingleCategory, updateCategory, deleteCategory } = require('../services/categoryService');

const handleCreateCategory = async (req, res, next) => {
  try {
    const {name} = req.body;

    const newCategory = await createCategory(name);

    return successResponse(res, {
      statusCode: 201,
      message: "Category is created successfully",
      payload: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetCategory = async (req, res, next) => {
  try {
    const categories = await getCategories();
    return successResponse(res, {
      statusCode: 200,
      message: "Categories fetched successfully",
      payload: categories,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetSingleCategory = async (req, res, next) => {
  try {
    const {slug} = req.params;
    const category = await getSingleCategory(slug);
     if (!category) {
      throw createError(404, "Category not found");
    }
    return successResponse(res, {
      statusCode: 200,
      message: "Categories fetched successfully",
      payload: category,
    });
  } catch (error) {
    next(error);
  }
};

const handleUpdateCategory = async (req, res, next) => {
  try {
    const {name} = req.body;
    const {slug} = req.params;
    const category = await updateCategory(name, slug);
    if (!category) {
          throw createError(404, "Category not found");
        }
    return successResponse(res, {
      statusCode: 200,
      message: "Category was update successfully",
      payload: category,
    });
  } catch (error) {
    next(error);
  }
};

const handleDeleteCategory = async (req, res, next) => {
  try {
    const {slug} = req.params;
    const category = await deleteCategory(slug);
    if (!category) {
      throw createError(404, "Category not found");
    }
    return successResponse(res, {
      statusCode: 200,
      message: "Category was deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {handleCreateCategory, handleGetCategory, handleGetSingleCategory, handleUpdateCategory, handleDeleteCategory};
