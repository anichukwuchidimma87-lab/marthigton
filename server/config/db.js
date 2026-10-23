import mongoose from "mongoose";

export async function connectDB() {
  const { MONGODB_URI } = process.env;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is required to start the API.");
  }

  await mongoose.connect(MONGODB_URI);
  console.info("Connected to MongoDB.");
}
