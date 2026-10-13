import mongoose from "mongoose";
import loadEnv, { ENV_PATH } from "./loadEnv.js";

const envFound = loadEnv();

let cachedConnection = null;

const connectDB = async () => {
  try {
    if (cachedConnection && mongoose.connection.readyState === 1) {
      console.log("Using existing MongoDB connection");
      return cachedConnection;
    }

    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error(
        envFound
          ? `MONGO_URI is missing inside ${ENV_PATH} (check the variable name)`
          : `.env file not found. Create it at: ${ENV_PATH}`,
      );
    }

    const connection = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });

    cachedConnection = connection;

    console.log(`MongoDB Connected: ${connection.connection.host}`);

    return connection;
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    throw error;
  }
};

export default connectDB;
