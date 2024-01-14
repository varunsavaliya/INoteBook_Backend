import bcrypt from "bcryptjs";
import { Router } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { ErrorMessages } from "../const/error.messages.constants.js";
import { Routes } from "../const/route.constants.js";
import isLoggedIn from "../middlewares/isLoggedIn.js";
import User from "../models/User.js";

const JWT_SECRET = "mySecret@secretMy";
const authRouter = Router();

// sign up and create user
authRouter.post(
  `/${Routes.AUTH.CREATE_USER}`,
  [
    body("name", ErrorMessages.VALID_NAME).isLength({ min: 3 }),
    body("email", ErrorMessages.VALID_EMAIL).isEmail(),
    body("password", ErrorMessages.PASSWORD_LENGTH).isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ error: ErrorMessages.USER_EXISTS });
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
      return res.status(200).json({ token });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

// login
authRouter.post(
  `/${Routes.AUTH.LOGIN}`,
  [
    body("email", ErrorMessages.VALID_EMAIL).isEmail(),
    body("password", ErrorMessages.EMPTY_PASSWORD).exists(),
  ],
  async (req, res) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res
          .status(400)
          .json({ error: ErrorMessages.INVALID_CREDENTIALS });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ error: ErrorMessages.INVALID_CREDENTIALS });
      }

      const jwtData = {
        id: user.id,
      };
      const token = jwt.sign(jwtData, JWT_SECRET);
      return res.status(200).json({ token });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

// get user details
authRouter.post(`/${Routes.AUTH.GET_USER}`, isLoggedIn, async (req, res) => {
  const id = req.id;
  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(400).json({ error: ErrorMessages.USER_NOT_FOUND });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default authRouter;
