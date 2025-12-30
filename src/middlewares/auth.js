const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const { jwtAccessKey } = require("../secret");
const mongoose = require("mongoose");

const isLoggedIn = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      throw createError(401, "Access token not found. Please login");
    }
    const decoded = jwt.verify(accessToken, jwtAccessKey);
    if (!decoded) {
      throw createError(401, "Invalid access token. please login again.");
    }
    // req.userId = decoded;
    req.user = decoded;
    next();
  } catch (error) {
    return next(error);
  }
};

const isLoggedOut = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, jwtAccessKey);
        if (decoded) {
          throw createError(400, "User is already logged in");
        }
      } catch (error) {
        throw error;
      }
    }
    next();
  } catch (error) {
    return next(error);
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if(!req.user.isAdmin){
      throw createError(403, "Forbidden. You must be an admin to access this resource.");
    }
    next();
  } catch (error) {
    return next(error);
  }
};

const validateObjectId = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createError(400, "Invalid user ID"));
    }
    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { isLoggedIn, isLoggedOut, isAdmin, validateObjectId };
