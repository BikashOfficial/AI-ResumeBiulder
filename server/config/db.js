import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    // console.log("MongoDB connected successfully!");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("DB connection error:", error.message);
    process.exit(1); // stop server if DB fails
  }
};
