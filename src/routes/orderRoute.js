const express = require("express");
const orderRouter = express.Router();
const { isLoggedIn, isAdmin } = require("../middlewares/auth");
const { createOrder, getAllOrders, updateOrderStatus } = require("../controller/orderColtroller");

orderRouter.post("/createorder", isLoggedIn, createOrder);

orderRouter.get("/allorders", isLoggedIn, isAdmin, getAllOrders);

orderRouter.put("/updatestatus/:orderId", isLoggedIn, isAdmin, updateOrderStatus);

module.exports = orderRouter;