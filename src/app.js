const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const createError = require('http-errors');
const { xss } = require("express-xss-sanitizer");
const rateLimite = require("express-rate-limit");
const userRouter = require("./routes/userRouter");
const { errorResponse } = require("./controller/errorController");
const authRouter = require("./routes/authRouter");
const cookieParser = require('cookie-parser');
const categoryRouter = require("./routes/categoryRoutes");
const productRouter = require("./routes/productRoutes");
const app = express();
const cors = require('cors');

const rateLimiter = rateLimite({
    windowMs: 1 * 60 * 1000, // one minutes
    max: 20,
    message: "Too many requist from this IP. please try again later"
});

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(cookieParser());
app.use(rateLimiter);
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(xss());


app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);

// home route
app.get("/", (req, res)=>{
    res.send("<h1>Welcome to Electro Selling</h1>")
})

// client error handle
app.use((req, res, next)=>{
    next(createError(404, 'Product not found'));
})

// server error handle
app.use((err, req, res, next)=>{
    return errorResponse(res, {
        statusCode: err.status,
        message: err.message
    })
});

module.exports = app;