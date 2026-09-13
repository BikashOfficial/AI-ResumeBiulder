import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import router from "./routes/ai.route.js";

dotenv.config();

const port = process.env.PORT || 8003;

const app = express();
connectDB();

app.use(express.json());

app.use("/", router);

app.get("/", (req, res) => {
  res.json({ message: "hellow from ai" });
});

app.listen(port, () => {
  console.log(`running ai on server ${port}`);
});
