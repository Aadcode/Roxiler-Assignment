import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
const app = express();
dotenv.config();

connectDB();


app.listen(process.env.PORT, () => {
  console.log(`Listening at ${process.env.PORT}`);
});
