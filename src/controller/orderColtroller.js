const createError = require("http-errors");
const Product = require("../modules/productsModules");
const Order = require("../modules/orderModules");

const createOrder = async (req, res, next) => {
  try {
    const { cart, address, totalAmount, phone } = req.body;

    if (!cart || cart.length === 0) throw createError(400, "Your cart is empty!");
    if (!address) throw createError(400, "Delivery address is required।");

    const order = await new Order({
      products: cart,
      payment: { status: "Cash on Delivery", method: "COD" },
      paymentMethod: "COD",
      buyer: req.user._id, 
      address,
      phone,
      totalAmount,
    }).save();

    const bulkOptions = cart.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
        },
      };
    });
    
    await Product.bulkWrite(bulkOptions);

    res.status(201).json({
      success: true,
      message: "Your order has been placed successfully (Cash on Delivery)",
      order,
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate("products.product", "name price image") 
      .populate("buyer", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      throw createError(404, "Order not found with this ID");
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getAllOrders, updateOrderStatus };