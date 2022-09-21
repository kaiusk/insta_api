import * as dotenv from "dotenv";

dotenv.config();
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

const user = require("./controller/user");
const basePath = "/" + process.env.BASE_URL + "/" + process.env.VERSION;

app.use(express.json());
app.use(basePath + "/users", user);

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
