import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDb } from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";
import aiRouter from "./routes/aiRoutes.js";

const app = express();
await connectDb();
app.use(express.json());
app.use(cors())

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Server is live...");
});

app.use("/api/users", userRouter);
app.use("/api/resumes", resumeRouter);
app.use("/api/ai",aiRouter)


app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
