import * as dotenv from "dotenv";

dotenv.config();
import userRoutes from "./controllers/user";
import postRoutes from "./controllers/post";
import express from "express";
import { expressjwt } from "express-jwt";
import cors from "cors";
import AuthErrorHandler from "./middleware/authErrorHandler";
//import logger from "./middleware/logger";

const app = express();
const PORT = process.env.PORT || 3000;
const basePath = "/" + process.env.BASE_URL + "/" + process.env.VERSION;

app.use(cors());
app.use(express.json());
//app.use(logger);

app.use(
  expressjwt({
    secret: process.env.JWT_SECRET || "secret",
    algorithms: ["HS256"],
  }).unless({
    path: [basePath + "/users/login"],
  })
);

app.use(AuthErrorHandler);

app.use(basePath + "/users", userRoutes);
app.use(basePath + "/posts", postRoutes);

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
