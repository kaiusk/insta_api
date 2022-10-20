import * as dotenv from "dotenv";
import userRoutes from "./controllers/user";
import postRoutes from "./controllers/post";
import statRoutes from "./controllers/stat";
import express from "express";
import { expressjwt } from "express-jwt";
import cors from "cors";
import AuthErrorHandler from "./middleware/authErrorHandler";

dotenv.config();
// import logger from "./middleware/logger";

const app = express();
const PORT = process.env.PORT ?? 3000;
const basePath = `/${process.env.BASE_URL ?? "api"}/${
  process.env.VERSION ?? "v1"
}`;

app.use(cors());
app.use(express.json());
// app.use(logger);

app.use(
  expressjwt({
    secret: process.env.JWT_SECRET ?? "secret",
    algorithms: ["HS256"],
  }).unless({
    path: [basePath + "/users/login"],
  })
);

app.use(AuthErrorHandler);
app.use(basePath + "/users", userRoutes);
app.use(basePath + "/posts", postRoutes);
app.use(basePath + "/stats", statRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default server;
