const createError = require("http-errors");
const User = require("../modules/userModules");
const bcrypt = require("bcryptjs");
const { createJsonWebToken } = require("../helpers/jsonWebToken");
const { jwtResetPasswordKey, clientUrl } = require("../secret");
const emailWithNodeMailer = require("../helpers/email");

const userAction = async (userId, action) => {
  try {
    let update;
    let successMessage;
    if (action === "ban") {
      update = { isBanned: true };
      successMessage = "User was banned successfully";
    } else if (action === "unban") {
      update = { isBanned: false };
      successMessage = "User was unbanned successfully";
    } else {
      throw createError(400, 'Invalid action. Use "ban" or "unban" ');
    }

    const userOptions = { new: true, runValidators: true, context: "query" };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      update,
      userOptions
    ).select("-password");

    if (!updatedUser) {
      throw createError(400, "User was not banned successfully");
    }
    return successMessage;
  } catch (error) {
    throw error;
  }
};

const updateUserPasswordById = async (
  userId,
  email,
  oldPassword,
  newPassword,
  confirmPassword
) => {
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      throw createError(404, "User is not found with this email.");
    }

    if (newPassword !== confirmPassword) {
      throw createError(
        400,
        "New password and confirmPassword did not match. "
      );
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      throw createError(400, "Old password is not correct.");
    }

    const updates = { $set: { password: newPassword } };
    const updateOptions = { new: true };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      updateOptions
    ).select("-password");

    if (!updatedUser) {
      throw createError(404, "User was not update successfully");
    }
    return updatedUser;
  } catch (error) {
    throw error;
  }
};

const forgotUserPassword = async (email, origin) => {
  try {
    const userData = await User.findOne({ email: email });
    if (!userData) {
      throw createError(
        404,
        "Email is incorrect or you have not verified your email address. Please register yourself first."
      );
    }

    const token = createJsonWebToken({ email }, jwtResetPasswordKey, "10m");

    const emailData = {
      email,
      subject: "Reset password Email",
      html: `
            <h2>Hello ${userData.name}</h2>
            <p>Please click here to <a href="${origin}/api/user/resetpassword/${token}" target="_blank">Reset your password</a></p>
          `,
    };

    emailWithNodeMailer(emailData);
    return token;
  } catch (error) {
    throw error;
  }
};

module.exports = { userAction, updateUserPasswordById, forgotUserPassword };
