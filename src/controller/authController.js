const createError = require("http-errors");
const User = require("../modules/userModules");
const { successResponse } = require("./errorController");
const bcrypt = require("bcryptjs");
const { jwtAccessKey, jwtRefresTokenKey } = require("../secret");
const { createJsonWebToken } = require("../helpers/jsonWebToken");
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(
        404,
        "User does not exists with this email. please register first."
      );
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw createError(
        401,
        "Email or password did not match."
      );
    }

    if (user.isBanned) {
      throw createError(401, "You are Banned. Please contact authority");
    }

    // const accessToken = createJsonWebToken(
    //   { user }, 
    //   jwtAccessKey, 
    //   "15m"
    // );

    // jwt payload fix
    const accessToken = createJsonWebToken(
      { _id: user._id, isAdmin: user.isAdmin },
      jwtAccessKey,
      "5m"
    );
    
    res.cookie('accessToken', accessToken, {
        maxAge: 5 * 60 * 1000, // 5 minutes
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    })

    const refreshToken = createJsonWebToken(
      { _id: user._id, isAdmin: user.isAdmin },
      jwtRefresTokenKey,
      "7d"
    );
    
    res.cookie('refreshToken', refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    })

    // const userWithoutPassword = await User.findOne({ email }).select('-password');
    
    // best way
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return successResponse(res, {
      statusCode: 200,
      message: "user login successfully",
      payload: {userWithoutPassword},
    });
  } catch (error) {
    next(error);
  }
};

const handleLogout = async (req, res, next) => {
  try {

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    };

    res.clearCookie('accessToken', cookieOptions);

    res.clearCookie('refreshToken', cookieOptions);

    return successResponse(res, {
      statusCode: 200,
      message: "user logout successfully",
      payload: {},
    });
  } catch (error) {
    next(error);
  }
};

const handleRefreshToken = async (req, res, next) => {
  try {

    const oldRefreshToken = req.cookies.refreshToken
   
    const decodedToken = jwt.verify(oldRefreshToken, jwtRefresTokenKey)

    if(!decodedToken){
      throw createError(401, "Invalid refresh token. please login again.");
    }

    const accessToken = createJsonWebToken(
      { _id: decodedToken._id, isAdmin: decodedToken.isAdmin },
      jwtAccessKey,
      "5m"
    );
    
    res.cookie('accessToken', accessToken, {
        maxAge: 5 * 60 * 1000, // 5 minutes
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    })

    return successResponse(res, {
      statusCode: 200,
      message: "New access token is generated.",
      payload: {},
    });
  } catch (error) {
    next(error);
  }
};

const handleProtected = async (req, res, next) => {
  try {

     const accessToken = req.cookies.accessToken
   
    const decodedToken = jwt.verify(accessToken, jwtAccessKey)

    if(!decodedToken){
      throw createError(401, "Invalid access token. please login again.");
    }
    
    return successResponse(res, {
      statusCode: 200,
      message: "Protected resource accessed successfully.",
      payload: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleLogin, handleLogout, handleRefreshToken, handleProtected };
