import Product from "../models/product.model.js";
import axios from "axios";
import { months } from "../constants.js";

// Helper function with error handling
const getMonthIndex = (month) => {
  const index = months.indexOf(month);
  if (index === -1) {
    throw new Error(
      `Invalid month: ${month}. Must be one of: ${months.join(", ")}`
    );
  }
  return index + 1;
};

export const initializeDB = async (req, res) => {
  try {
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Database is already initialized",
      });
    }

    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json",
      { timeout: 5000 }
    );

    if (!Array.isArray(response.data)) {
      throw new Error("Invalid data format from API");
    }

    const transformedData = response.data.map((item) => ({
      ...item,
      dateOfSale: new Date(item.dateOfSale),
      price: parseFloat(item.price),
    }));

    await Product.insertMany(transformedData, { ordered: false });

    res.status(200).json({
      success: true,
      message: "Database successfully initialized",
      count: transformedData.length,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Duplicate entries found in the data",
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { month = "March", search = "", page = 1, per_page = 10 } = req.query;

    if (!months.includes(month)) {
      return res.status(400).json({
        error: "Invalid month",
        validMonths: months,
      });
    }

    const monthIndex = getMonthIndex(month);
    const pageNum = Math.max(1, parseInt(page));
    const perPageNum = Math.min(100, Math.max(1, parseInt(per_page)));

    const pipeline = [];

    pipeline.push({
      $match: {
        $expr: {
          $eq: [{ $month: "$dateOfSale" }, monthIndex],
        },
      },
    });

    if (search.trim()) {
      const numericSearch = parseFloat(search);
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            ...(isNaN(numericSearch) ? [] : [{ price: numericSearch }]),
          ],
        },
      });
    }

    const [countResult] = await Product.aggregate([
      ...pipeline,
      { $count: "total" },
    ]).option({ maxTimeMS: 5000 });

    const total = countResult?.total || 0;

    const totalPages = Math.ceil(total / perPageNum);
    const adjustedPage = Math.min(pageNum, Math.max(1, totalPages));
    const adjustedSkip = (adjustedPage - 1) * perPageNum;

    const results = await Product.aggregate([
      ...pipeline,
      { $skip: adjustedSkip },
      { $limit: perPageNum },
    ]).option({ maxTimeMS: 5000 });

    res.status(200).json({
      data: results,
      pagination: {
        total,
        page: adjustedPage,
        per_page: perPageNum,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.error("Error in getTransactions:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

export const getStatistics = async (req, res) => {
  try {
    const { month = "March" } = req.query;
    const monthIndex = getMonthIndex(month);

    const pipeline = [
      {
        $match: {
          $expr: {
            $eq: [{ $month: "$dateOfSale" }, monthIndex],
          },
        },
      },

      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$price" },
          soldItemsCount: {
            $sum: {
              $cond: [{ $eq: ["$sold", true] }, 1, 0],
            },
          },
          notSoldItemsCount: {
            $sum: {
              $cond: [{ $eq: ["$sold", false] }, 1, 0],
            },
          },
          totalItems: { $sum: 1 },
        },
      },

      {
        $project: {
          _id: 0,
          totalRevenue: { $round: ["$totalRevenue", 2] },
          soldItemsCount: 1,
          notSoldItemsCount: 1,
          totalItems: 1,
        },
      },
    ];

    const [result] = await Product.aggregate(pipeline);

    const response = result || {
      totalRevenue: 0,
      soldItemsCount: 0,
      notSoldItemsCount: 0,
      totalItems: 0,
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBarChart = async (req, res) => {
  const { month } = req.query;
  const monthIndex = getMonthIndex(month);

  const pipeline = [
    {
      $match: {
        $expr: {
          $eq: [{ $month: "$dateOfSale" }, monthIndex],
        },
      },
    },
    {
      $bucket: {
        groupBy: "$price",
        boundaries: [0, 101, 201, 301, 401, 501, 601, 701, 801, 901],
        default: "901-above",
        output: {
          count: { $sum: 1 },
        },
      },
    },
    {
      $project: {
        name: "$_id",
        total: "$count",
        _id: 0,
      },
    },
  ];

  try {
    const results = await Product.aggregate(pipeline);
    console.log(results);

    const allRanges = [
      { name: "0-100", total: 0 },
      { name: "101-200", total: 0 },
      { name: "201-300", total: 0 },
      { name: "301-400", total: 0 },
      { name: "401-500", total: 0 },
      { name: "501-600", total: 0 },
      { name: "601-700", total: 0 },
      { name: "701-800", total: 0 },
      { name: "801-900", total: 0 },
      { name: "901-above", total: 0 },
    ];

    const completeResults = allRanges.map((range) => {
      // Parse the range
      const [start, end] = range.name
        .split("-")
        .map((num) => (num === "above" ? Infinity : parseInt(num)));

      // Find matching result by checking if number falls within range
      const found = results.find((r) => {
        const num = parseInt(r.name);
        return num >= start && (end === Infinity ? true : num <= end);
      });

      return found
        ? {
            name: range.name,
            total: found.total,
          }
        : range;
    });

    res.status(200).json({
      success: true,
      data: completeResults,
      month,
    });
  } catch (error) {
    console.error("Error generating bar chart data:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPieChartData = async (req, res) => {
  const { month } = req.query;
  const monthIndex = getMonthIndex(month);

  const pipeline = [
    {
      $match: {
        $expr: {
          $eq: [{ $month: "$dateOfSale" }, monthIndex],
        },
      },
    },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ];

  try {
    const result = await Product.aggregate(pipeline);

    const formattedResult = result.map((item) => ({
      category: item._id,
      count: item.count,
    }));

    res.status(200).json({
      success: true,
      data: formattedResult,
      month,
    });
  } catch (error) {
    console.error("Error fetching pie chart data:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
