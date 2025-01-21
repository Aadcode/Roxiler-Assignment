import express from "express";
import {
  initializeDB,
  getTransactions,
  getStatistics,
  getBarChart,
  getPieChartData,
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/initialize", initializeDB);
router.get("/transactions", getTransactions);
router.get("/statistics", getStatistics);
router.get("/bar-chart", getBarChart);
router.get("/pie-chart", getPieChartData);

export default router;
