const slugify = require('slugify')
const Category = require('../modules/categoryModules');
const createError = require('http-errors');
const he = require("he");

const createCategory = async (name) => {
    const cleanName = he.decode(name);
    const exists = await Category.findOne({ name: cleanName });
    if (exists) {
      throw createError(409, "Category already exists");
    }
    const newCategory = await Category.create({
        name: cleanName,
        slug: slugify(cleanName, { lower: true })
    })
    return newCategory;
};

const getCategories = async () => {
    return await Category.find({}).select('name slug').lean();
};

const getSingleCategory = async (slug) => {
    return await Category.findOne({slug}).select('name slug').lean();
};

const updateCategory = async (name, slug) => {
    const cleanName = he.decode(name);
    const filter = {slug};
    const updates = { $set: { name: cleanName, slug: slugify(cleanName, {lower: true}) } }
    const options = { new: true }
    const updateCategory = await Category.findOneAndUpdate(
      filter,
      updates,
      options,
    );
    return updateCategory;
};

const deleteCategory = async (slug) => {
    const result = await Category.findOneAndDelete({slug});
    return result;
};

module.exports = {createCategory, getCategories, getSingleCategory, updateCategory, deleteCategory};
