const express = require("express");
const { getAllUser, getUserById, deleteUserById, processRegister, activateUseAccount, updateUserById, manageUserStatusById, updateUserPassword, updateUserForgotPassword, resetUserPassword } = require("../controller/userColtroller");
const {uploadUserImage} = require("../middlewares/uploadFile");
const { validateUserRegistration, validateUserUpdatePassword, validateUserForgotPassword, validateUserResetPassword } = require("../validator/auth");
const runValidation = require("../validator");
const { isLoggedIn, isLoggedOut, isAdmin, validateObjectId } = require("../middlewares/auth");
const userRouter = express.Router();

userRouter.post("/process-register", uploadUserImage.single("image"), isLoggedOut, validateUserRegistration, runValidation, processRegister)

userRouter.post("/activate", isLoggedOut, activateUseAccount)

userRouter.get("/", isLoggedIn, isAdmin, getAllUser)

userRouter.put("/manage-user/:id", isLoggedIn, isAdmin, manageUserStatusById)

userRouter.put("/update-password/:id", validateUserUpdatePassword, runValidation, isLoggedIn, validateObjectId, updateUserPassword)

userRouter.post("/forgot-password", validateUserForgotPassword, runValidation, updateUserForgotPassword)

userRouter.put("/reset-password", validateUserResetPassword, runValidation, resetUserPassword)

userRouter.get("/:id", isLoggedIn, validateObjectId, getUserById)

userRouter.delete("/:id", isLoggedIn, validateObjectId, deleteUserById)

userRouter.put("/:id", isLoggedIn, validateObjectId, uploadUserImage.single("image"), updateUserById)

module.exports = userRouter;