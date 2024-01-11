import connectToMongo from "./dbConfig.js";
import express from "express";

connectToMongo();

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
