import jwt from "jsonwebtoken";
import { Messages } from "../const/messages.constants.js";
import AppError from "../utils/error.util.js";

const JWT_SECRET = "mySecret@secretMy";

// middleware to check if user logged in or not
const isLoggedIn = (req, res, next) => {
  const token = req.header("token");
  if (!token) {
    return next(new AppError(Messages.ERRORS.USER_NOT_AUTHORIZED, 401));
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.id = data.id;
    next();
  } catch (error) {
    return next(new AppError(Messages.ERRORS.USER_NOT_AUTHORIZED, 401));
  }
};

export default isLoggedIn;
