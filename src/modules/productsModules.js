const { Schema, model } = require("mongoose");

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
    discountPrice: {
      type: Number,
      default: 0,
      validate: {
        validator: function (value) {
          const price =
            this.price || (this.getUpdate ? this.getUpdate().$set.price : null);
          return value <= (price || Infinity);
        },
        message:
          "Discount price ({VALUE}) must be less than or equal to the regular price",
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
      required: [true, "Product images are required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    weight: {
      type: Number,
      required: [true, "Product weight is required"],
      min: [0, "Weight cannot be negative"],
      default: 0,
    },
    brand: {
      type: String,
      trim: true,
      required: [true, "Product brand is required"],
    },
  },
  { timestamps: true }
);

const Product = model("Product", productsSchema);
module.exports = Product;