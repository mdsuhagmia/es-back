const { Schema, model } = require("mongoose");
const { defaultImagePath } = require("../secret");

const productsSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters long"],
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      minlength: [
        10,
        "Product description must be at least 10 characters long",
      ],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      trim: true,
      validate: {
        validator: function (value) {
          return value > 0;
        },
        message: (props) => `${props.value} is not a valid price`,
      },
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
      trim: true,
      validate: {
        validator: function (value) {
          return value > 0;
        },
        message: (props) => `${props.value} is not a valid quantity`,
      },
    },
    sold: {
      type: Number,
      required: [true, "sold quantity is required"],
      trim: true,
      default: 0,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      required: [true, "Product images are required"]
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
  },
  { timestamps: true},
);

const Product = model("Product", productsSchema);
module.exports = Product;
