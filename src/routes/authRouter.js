const express = require('express');
const { handleLogin, handleLogout, handleRefreshToken, handleProtected } = require('../controller/authController');
const { isLoggedOut, isLoggedIn, isAdmin } = require('../middlewares/auth');
const { validateUserLogin } = require('../validator/auth');
const runValidation = require('../validator');
const authRouter = express.Router();

authRouter.post("/login", validateUserLogin, runValidation, isLoggedOut, handleLogin);
authRouter.post("/logout", isLoggedIn, handleLogout);
authRouter.get("/refresh-token", handleRefreshToken);
authRouter.get("/protected", handleProtected);
authRouter.get("/me", isLoggedIn, isAdmin, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = authRouter;