import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import cors from "cors";
import transactionRoutes from "./routes/transaction.route.js";
const app = express();
dotenv.config();
app.use(cors());

connectDB();

app.use("/api/v1", transactionRoutes);

app.get;
app.listen(process.env.PORT, () => {
  console.log(`Listening at ${process.env.PORT}`);
});
