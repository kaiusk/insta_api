import * as dotenv from "dotenv";
import userRoutes from "./controller/user";

dotenv.config();
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;
const basePath = "/" + process.env.BASE_URL + "/" + process.env.VERSION;

app.use(express.json());
app.use(basePath + "/users", userRoutes);

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
