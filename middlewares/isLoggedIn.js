import jwt from "jsonwebtoken";
import { ErrorMessages } from "../const/error.messages.constants.js";

const JWT_SECRET = "mySecret@secretMy";

// middleware to check if user logged in or not
const isLoggedIn = (req, res, next) => {
  const token = req.header("token");
  if (!token) {
    return res.status(401).json({ error: ErrorMessages.USER_NOT_AUTHORIZED });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.id = data.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: ErrorMessages.USER_NOT_AUTHORIZED });
  }
};

export default isLoggedIn;
