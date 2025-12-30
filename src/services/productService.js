const slugify = require('slugify')
const createError = require("http-errors");
const Product = require('../modules/productsModules');
const cloudinary = require('../config/cloudinary');

const createProduct = async (productData, image)=>{
    if (image && image.size > 1024 * 1024 * 2) {
      throw createError(400, "File too large. It must be less than 2 MB");
    }  

    if(image){
      const response = await cloudinary.uploader.upload(image, {
          folder: 'ElectroSelling/products'
        });
        productData.image = response.secure_url;
    }

    const productExists = await Product.exists({ title: productData.title });
     if (productExists) {
       throw createError(409, "Product with this name already exist.");
     }

    const product = await Product.create({
        ...productData,
        slug: slugify(productData.title),
    })

    return product;
}

module.exports = {createProduct}