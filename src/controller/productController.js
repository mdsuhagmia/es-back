const createError = require("http-errors");
const { successResponse } = require("./errorController");
const findWithId = require("../services/findItem");
const Product = require("../modules/productsModules");
const slugify = require("slugify");
const { createProduct } = require("../services/productService");
const deleteImage = require("../helpers/deleteImageHelper");
const {publicIdWithoutExtensionFromUrl, deleteFileFromCloudinary} = require("../helpers/cloudinaryHelper");
const cloudinary = require("../config/cloudinary");

const handleCreateProduct = async (req, res, next) => {
  try {
    const image = req.file?.path;

    const product = await createProduct(req.body, image);

    return successResponse(res, {
      statusCode: 200,
      message: "Product was created successfully.",
      payload: {product}
    });
  } catch (error) {
    next(error);
  }
};

const handleGetProduct = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const searchRegExp = new RegExp(search, "i");

    const filter = {
      $or: [
        { name: { $regex: searchRegExp } }
      ],
    };

    const products = await Product.find(filter)
    .populate('category')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 })

    if(!products){
      throw createError(404, 'Product not found');
    }

    const count = await Product.find(filter).countDocuments();

    return successResponse(res, {
      statusCode: 200,
      message: "Products fetched successfully.",
      payload: {
        Products: products,
        Pagination: {
          TotalProducts: count,
          currentPage: page,
          totalPages: Math.ceil(count / limit),
        },
      }
    });
  } catch (error) {
    next(error);
  }
};

const handleGetSingleProduct = async (req, res, next) => {
  try {
    const {slug} = req.params;
    const product = await Product.findOne({slug}).populate('category');

    if(!product){
      throw createError(404, 'Product not found.')
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Returned single product.",
      payload: product
    });
  } catch (error) {
    next(error);
  }
};

// const handleUpdateProduct = async (req, res, next) => {
//   try {
//     const {slug} = req.params;
//     const userOptions = { new: true, runValidators: true, context: "query" };
//     let updates = {};

//     const allowedFields = ["title", "description", "price", "quantity", "sold", "shipping", "category"];
//     for (let key in req.body) {
//       if (allowedFields.includes(key)) {
//         updates[key] = req.body[key];
//       }
//     }
//     const image = req.file?.path;
//     if (image) {
//       if (image.size > 1024 * 1024 * 2) {
//         throw createError(400, "File too large. It must be less than 2 MB");
//       }
//       updates.image = image;
//       Product.image !== "defauld.png" && deleteImage(Product.image);
//     }

//     const updatedProduct = await Product.findOneAndUpdate(
//       {slug},
//       updates,
//       userOptions
//     )

//     if (!updatedProduct) {
//       throw createError(404, "Product with this slug does not exists");
//     }

//     return successResponse(res, {
//       statusCode: 200,
//       message: "Product was updated successfully.",
//       payload: { updatedProduct }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const handleUpdateProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    const existingProduct = await Product.findOne({ slug });
    if (!existingProduct) {
      throw createError(404, "Product not found");
    }

    let updates = {};

    const allowedFields = ["title", "description", "price", "quantity", "sold", "shipping", "category"];

    for (let key in req.body) {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    }

    // if (req.file) {
    //   updates.image = req.file.path;

    //   if (existingProduct.image && existingProduct.image !== "defauld.png") {
    //     await deleteImage(existingProduct.image);
    //   }
    // }

    const image = req.file.path
    if(image){
      if (image && image.size > 1024 * 1024 * 2) {
        throw createError(400, "File too large. It must be less than 2 MB");
      }
      const response = await cloudinary.uploader.upload(image, {
        folder: "ElectroSelling/products",
      });
      updates.image = response.secure_url;
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { slug },
      updates,
      { new: true, runValidators: true, context: "query" }
    );

    if(!updatedProduct){
      throw createError(409, 'Updating product was not possible.')
    }

    if(existingProduct.image){
      const publicId = await publicIdWithoutExtensionFromUrl(existingProduct.image);
      await deleteFileFromCloudinary("ElectroSelling/products", publicId, "Product")
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Product updated successfully.",
      payload: { updatedProduct },
    });
  } catch (error) {
    next(error);
  }
};

const handleDeleteProduct = async (req, res, next) => {
  try {
    const {slug} = req.params;

    const existtingProduct = await Product.findOne({slug})
    if(!existtingProduct){
      throw createError(404, 'Product not found');
    }
    if(existtingProduct.image){
        const publicId = await publicIdWithoutExtensionFromUrl(existtingProduct.image)
        deleteFileFromCloudinary("ElectroSelling/products", publicId, "Product")
      }

    await Product.findOneAndDelete({slug});

    // if(!product){
    //   throw createError(404, 'Product not found');
    // }

    // if (product.image) {
    //   await deleteImage(product.image);
    // }

    return successResponse(res, {
      statusCode: 200,
      message: "Product delete successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleCreateProduct,
  handleGetProduct,
  handleGetSingleProduct,
  handleUpdateProduct,
  handleDeleteProduct
};
