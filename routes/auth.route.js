import bcrypt from "bcryptjs";
import { Router } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = "mySecret@secretMy";
const authRouter = Router();

authRouter.post(
  "/",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
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
        return res
          .status(400)
          .json({ error: "Sorry, a user with this email already exists" });
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
        name: user.name,
        email: user.email,
      };
      const token = jwt.sign(jwtData, JWT_SECRET);
      return res.status(200).json({ token });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

export default authRouter;
