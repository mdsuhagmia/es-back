const createError = require("http-errors");
const { successResponse } = require("./errorController");
const Product = require("../modules/productsModules");
const { createProduct } = require("../services/productService");
const {publicIdWithoutExtensionFromUrl, deleteFileFromCloudinary} = require("../helpers/cloudinaryHelper");
const cloudinary = require("../config/cloudinary");

const handleCreateProduct = async (req, res, next) => {
  try {
    const images = req.files ? req.files.map(file => file.path) : [];

    const product = await createProduct(req.body, images);

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
        { title: { $regex: searchRegExp } }
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

    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      
      for (const file of req.files) {
        if (file.size > 1024 * 1024 * 2) {
          throw createError(400, "Each file must be less than 2 MB");
        }

        const response = await cloudinary.uploader.upload(file.path, {
          folder: "ElectroSelling/products",
        });
        imageUrls.push(response.secure_url);
      }

      updates.images = imageUrls;

      if (existingProduct.images && existingProduct.images.length > 0) {
        for (const oldImageUrl of existingProduct.images) {
          const publicId = await publicIdWithoutExtensionFromUrl(oldImageUrl);
          await deleteFileFromCloudinary("ElectroSelling/products", publicId, "Product");
        }
      }
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { slug },
      updates,
      { new: true, runValidators: true, context: "query" }
    );

    if (!updatedProduct) {
      throw createError(409, 'Updating product was not possible.');
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

    const existingProduct = await Product.findOne({slug})
    if(!existingProduct){
      throw createError(404, 'Product not found');
    }
    if (existingProduct.images && existingProduct.images.length > 0) {
      for (const url of existingProduct.images) {
        const publicId = await publicIdWithoutExtensionFromUrl(url);
        await deleteFileFromCloudinary(
          "ElectroSelling/products",
          publicId,
          "Product"
        );
      }
    }

    await Product.findOneAndDelete({slug});

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
