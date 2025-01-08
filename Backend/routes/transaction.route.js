
import express from "express";
import {
  initializeDatabase,
  listTransactions,
  getStatistics,
  getBarChartData,
  getPieChartData,
  getCombinedData,
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/initialize", initializeDatabase);
router.get("/transactions", listTransactions);
router.get("/statistics", getStatistics);
router.get("/bar-chart", getBarChartData);
router.get("/pie-chart", getPieChartData);
router.get("/combined-data", getCombinedData);

export default router;
