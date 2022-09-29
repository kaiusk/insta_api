import * as dotenv from "dotenv";
import userRoutes from "./controller/user";

dotenv.config();
import express, { Request, Response, NextFunction } from "express";

const app = express();
const PORT = process.env.PORT || 3000;
const basePath = "/" + process.env.BASE_URL + "/" + process.env.VERSION;

app.use(express.json());

const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method}: ${req.url} - ${new Date().toISOString()}`);
  next();
};

app.use(logger);

app.use(basePath + "/users", userRoutes);

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
