import cors from "cors";
import express, { json } from "express";
import { SystemConstants } from "./const/system.constants.js";
import connectToMongo from "./dbConfig.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import authRouter from "./routes/auth.route.js";
import noteRouter from "./routes/note.route.js";
import AppError from "./utils/error.util.js";

connectToMongo();

const app = express();
const PORT = 5000;

// middlewares

app.use(cors());
app.use(json());

app.use("/api/auth", authRouter);
app.use("/api/note", noteRouter);

app.all("*", (req, res, next) => {
  return next(new AppError(SystemConstants.ROUTE_NOT_FOUND, 404));
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
