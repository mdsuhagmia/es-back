const slugify = require('slugify')
const createError = require("http-errors");
const Product = require('../modules/productsModules');
const cloudinary = require('../config/cloudinary');

const createProduct = async (productData, images) => {
  const productExists = await Product.exists({ title: productData.title });
  if (productExists) {
    throw createError(409, "Product with this name already exists.");
  }

  const imageUrls = [];

  if (images && images.length > 0) {
    for (const imagePath of images) {
      const response = await cloudinary.uploader.upload(imagePath, {
        folder: 'ElectroSelling/products'
      });
      imageUrls.push(response.secure_url);
    }
  }

  const product = await Product.create({
    ...productData,
    slug: slugify(productData.title),
    images: imageUrls,
  });

  return product;
};

module.exports = {createProduct}