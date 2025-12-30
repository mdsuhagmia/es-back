const createError = require("http-errors");
const User = require("../modules/userModules");
const { successResponse } = require("./errorController");
const findWithId = require("../services/findItem");
const { createJsonWebToken } = require("../helpers/jsonWebToken");
const {
  jwtActivationKey,
  clientUrl,
  jwtResetPasswordKey,
} = require("../secret");
const emailWithNodeMailer = require("../helpers/email");
const jwt = require("jsonwebtoken");
const deleteImage = require("../helpers/deleteImageHelper");
const {
  userAction,
  updateUserPasswordById,
  forgotUserPassword,
} = require("../services/userService");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");
const {
  publicIdWithoutExtensionFromUrl,
  deleteFileFromCloudinary,
} = require("../helpers/cloudinaryHelper");

const getAllUser = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const searchRegExp = new RegExp(search, "i");

    const filter = {
      isAdmin: { $ne: true },
      $or: [
        { name: { $regex: searchRegExp } },
        { email: { $regex: searchRegExp } },
        { phone: { $regex: searchRegExp } },
      ],
    };

    const count = await User.countDocuments(filter);

    const users = await User.find(filter)
      .limit(limit)
      .skip(skip)
      .select({ password: 0 })
      .exec();

    if (!users || users.length === 0) {
      throw createError(404, "No users found");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "users were returned successfully",
      payload: {
        users: users,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalUsers: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    // console.log(req.user)
    const id = req.params.id;
    const options = { password: 0 };
    const user = await findWithId(User, id, options);
    return successResponse(res, {
      statusCode: 200,
      message: "user were returned successfully",
      payload: { user },
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw createError(400, "Invalid id");
    }
    next(error);
  }
};

const deleteUserById = async (req, res, next) => {
  try {
    const id = req.params.id;

    const existingUser = await User.findOne({
      _id: id,
    });

    if (existingUser && existingUser.image) {
      const publicId = await publicIdWithoutExtensionFromUrl(
        existingUser.image
      );
      deleteFileFromCloudinary("ElectroSelling/users", publicId, "User");
    }

    await User.findByIdAndDelete({
      _id: id,
      isAdmin: false,
    });

    // const id = req.params.id;
    // const options = { password: 0 };
    // const user = await findWithId(User, id, options);

    // await User.findByIdAndDelete({
    //   _id: id,
    //   isAdmin: false,
    // });

    // if(user && user.image){
    //   await deleteImage(user.image);
    // }

    return successResponse(res, {
      statusCode: 200,
      message: "user was deleted successfully",
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw createError(400, "Invalid id");
    }
    next(error);
  }
};

const processRegister = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const image = req.file?.path;

    if (image && image.size > 1024 * 1024 * 2) {
      throw createError(400, "File too large. It must be less than 2 MB");
    }

    const userExists = await User.exists({ email: email });
    if (userExists) {
      throw createError(409, "User with this already exist. please sign in");
    }

    const tokenPayloadData = {
      name,
      email,
      password,
      phone,
      address,
    };
    if (image) {
      tokenPayloadData.image = image;
    }
    const token = createJsonWebToken(tokenPayloadData, jwtActivationKey, "10m");

    const emailData = {
      email,
      subject: "Account activation Email",
      html: `
        <h2>Hello ${name}</h2>
        <p>Please click here to <a href="${clientUrl}/api/user/activate/${token}" target="_blank">Activate your account</a></p>
      `,
    };

    try {
      await emailWithNodeMailer(emailData);
    } catch (error) {
      next(createError(500, "Failed to send verification email"));
      return;
    }

    return successResponse(res, {
      statusCode: 200,
      message: `Please go to your ${email} for complete registration process`,
      payload: { token },
    });
  } catch (error) {
    next(error);
  }
};

const activateUseAccount = async (req, res, next) => {
  try {
    if (!req.body) {
      throw createError(400, "Request body is missing");
    }

    const token = req.body.token;

    if (!token) throw createError(404, "Token not found");
    try {
      const decoded = jwt.verify(token, jwtActivationKey);
      if (!decoded) throw createError(401, "Unable to verify user");
      const userExists = await User.exists({ email: decoded.email });
      if (userExists) {
        throw createError(409, "User with this already exist. please sign in");
      }

      const image = decoded.image;
      if (image) {
        const response = await cloudinary.uploader.upload(image, {
          folder: "ElectroSelling/users",
        });
        decoded.image = response.secure_url;
      }

      await User.create(decoded);

      return successResponse(res, {
        statusCode: 201,
        message: "User registered was successfully",
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw createError(401, "Token has expired");
      } else if (error.name === "JsonWebTokenError") {
        throw createError(401, "Invalid token");
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
};

const updateUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const options = { password: 0 };
    const user = await findWithId(User, userId, options);

    if (!user) {
      throw createError(404, "Product not found.");
    }

    const userOptions = { new: true, runValidators: true, context: "query" };
    let updates = {};

    const allowedFields = ["name", "password", "phone", "address"];
    for (let key in req.body) {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      } else if (key === "email") {
        throw createError(400, "Email can not be updated");
      }
    }
    const image = req.file?.path;
    if (image) {
      if (image.size > 1024 * 1024 * 2) {
        throw createError(400, "File too large. It must be less than 2 MB");
      }
      const response = await cloudinary.uploader.upload(image, {
        folder: "ElectroSelling/users",
      });
      updates.image = response.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      userOptions
    ).select("-password");

    if (!updatedUser) {
      throw createError(404, "User with this id does not exists");
    }

    if (user.image) {
      const publicId = await publicIdWithoutExtensionFromUrl(
        user.image
      );
      await deleteFileFromCloudinary(
        "ElectroSelling/users",
        publicId,
        "User"
      );
    }

    return successResponse(res, {
      statusCode: 200,
      message: "user was updated successfully",
      payload: updatedUser,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw createError(400, "Invalid id");
    }
    next(error);
  }
};

const manageUserStatusById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const action = req.body.action;

    const successMessage = await userAction(userId, action);

    return successResponse(res, {
      statusCode: 200,
      message: successMessage,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw createError(400, "Invalid id");
    }
    next(error);
  }
};

const updateUserPassword = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    const updatedUser = await updateUserPasswordById(
      userId,
      email,
      oldPassword,
      newPassword,
      confirmPassword
    );

    return successResponse(res, {
      statusCode: 200,
      message: "user password Update successfully",
      payload: { updatedUser },
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw createError(400, "Invalid id");
    }
    next(error);
  }
};

const updateUserForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const token = await forgotUserPassword(email);

    return successResponse(res, {
      statusCode: 200,
      message: `Please go to your ${email} for reseting the password.`,
      payload: { token },
    });
  } catch (error) {
    next(error);
  }
};

const resetUserPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, jwtResetPasswordKey);
    if (!decoded) {
      throw createError(400, "Invalid or expired token");
    }

    const filter = { email: decoded.email };
    const update = { password: password };
    const options = { new: true };

    const updateUser = await User.findOneAndUpdate(
      filter,
      update,
      options
    ).select("-password");

    if (!updateUser) {
      throw createError(400, "Password reset faild");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUser,
  getUserById,
  deleteUserById,
  processRegister,
  activateUseAccount,
  updateUserById,
  manageUserStatusById,
  updateUserPassword,
  updateUserForgotPassword,
  resetUserPassword,
};
