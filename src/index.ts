import * as dotenv from "dotenv";

dotenv.config();
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

const user = require("./controller/user");

app.use(express.json());

app.use("/users", user);

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
