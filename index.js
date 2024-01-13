import express, { json } from "express";
import connectToMongo from "./dbConfig.js";
import authRouter from "./routes/auth.route.js";
import noteRouter from "./routes/note.route.js";

connectToMongo();

const app = express();
const PORT = 5000;

// middlewares

app.use(json());

app.use("/api/auth", authRouter);
app.use("/api/note", noteRouter);

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
