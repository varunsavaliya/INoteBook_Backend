import { Router } from "express";

const noteRouter = Router();

noteRouter.get("/", (req, res) => {
  res.send("Working");
});

export default noteRouter;
