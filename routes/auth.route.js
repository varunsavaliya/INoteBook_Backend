import bcrypt from "bcryptjs";
import { Router } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { Messages } from "../const/messages.constants.js";
import { Routes } from "../const/route.constants.js";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
import User from "../models/User.js";
import AppError from "../utils/error.util.js";

const JWT_SECRET = "mySecret@secretMy";
const authRouter = Router();

// sign up and create user
authRouter.post(
  `/${Routes.AUTH.CREATE_USER}`,
  [
    body("name", Messages.ERRORS.VALID_NAME).isLength({ min: 3 }),
    body("email", Messages.ERRORS.VALID_EMAIL).isEmail(),
    body("password", Messages.ERRORS.PASSWORD_LENGTH).isLength({
      min: 5,
    }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return next(new AppError(Messages.ERRORS.USER_EXISTS, 400));
      }
      const salt = await bcrypt.genSalt();
      const secPass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      const jwtData = {
        id: user.id,
      };
      const token = jwt.sign(jwtData, JWT_SECRET);
      return res.status(200).json({
        success: true,
        message: Messages.SUCCESS.SIGN_UP,
        data: { token },
      });
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
  }
);

// login
authRouter.post(
  `/${Routes.AUTH.LOGIN}`,
  [
    body("email", Messages.ERRORS.VALID_EMAIL).isEmail(),
    body("password", Messages.ERRORS.EMPTY_PASSWORD).exists(),
  ],
  async (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (!user) {
        return next(new AppError(Messages.ERRORS.INVALID_CREDENTIALS, 400));
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return next(new AppError(Messages.ERRORS.INVALID_CREDENTIALS, 400));
      }

      const jwtData = {
        id: user.id,
      };
      const token = jwt.sign(jwtData, JWT_SECRET);
      return res.status(200).json({
        success: true,
        message: Messages.SUCCESS.LOGIN,
        data: { token },
      });
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
  }
);

// get user details
authRouter.post(
  `/${Routes.AUTH.GET_USER}`,
  isLoggedIn,
  async (req, res, next) => {
    const id = req.id;
    try {
      const user = await User.findById(id).select("-password");
      if (!user) {
        return next(new AppError(Messages.ERRORS.USER_NOT_FOUND, 400));
      }

      return res.status(200).json({
        success: true,
        message: Messages.SUCCESS.USER_RETRIEVED,
        data: user,
      });
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
  }
);

export default authRouter;
