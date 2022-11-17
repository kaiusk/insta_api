import * as dotenv from "dotenv";
import express from "express";
import { expressjwt } from "express-jwt";
import cors from "cors";
import logger from "morgan";
import apiCache from "apicache";
import * as redis from "redis";
import userRoutes from "./controllers/user";
import postRoutes from "./controllers/post";
import statRoutes from "./controllers/stat";
import AuthErrorHandler from "./middleware/authErrorHandler";

dotenv.config();

const app = express();

const basePath = `/${process.env.BASE_URL ?? "api"}/${
  process.env.VERSION ?? "v1"
}`;

app.use(cors());
app.use(express.json());
app.use(logger("dev"));

/*const cacheWithRedis = apiCache.options({
  redisClient: redis.createClient(),
}).middleware;

app.use(cacheWithRedis("5 minutes"));*/

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
app.all("*", (req, res) => {
  res.send("PAGE NOT FOUND");
});

export default app;
