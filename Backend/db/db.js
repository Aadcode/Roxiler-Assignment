import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DATABASE_URL}/${DB_NAME}`
    );

    console.log(
      `Database Connected Sucessfully ${
         connectionInstance.connection.host
      }`
    );
  } catch (error) {
    console.log("Error in Database connection", error);
    process.exit(1);
  }
};

export default connectDB;
