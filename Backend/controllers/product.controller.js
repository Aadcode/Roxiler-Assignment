import Product from "../models/product.model.js";
import axios from "axios";

const PRICE_RANGES = [
  { min: 0, max: 100 },
  { min: 101, max: 200 },
  { min: 201, max: 300 },
  { min: 301, max: 400 },
  { min: 401, max: 500 },
  { min: 501, max: 600 },
  { min: 601, max: 700 },
  { min: 701, max: 800 },
  { min: 801, max: 900 },
  { min: 901, max: Infinity },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getMonthIndex = (month) => MONTHS.indexOf(month) + 1;

const createMonthMatchStage = (monthIndex) => ({
  $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex] },
});

const handleError = (res, message, error) => {
  console.error(`Error: ${message}`, error);
  return res.status(500).json({
    message,
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Internal server error",
  });
};

const fetchTransactions = async (
  month,
  search = "",
  page = 1,
  perPage = 10
) => {
  const monthIndex = getMonthIndex(month);
  const query = {
    $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex] },
  };

  if (search) {
    const searchNumber = parseFloat(search);
    const searchQuery = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        ...(isNaN(searchNumber) ? [] : [{ price: searchNumber }]),
      ],
    };

    query.$and = [
      { $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex] } },
      searchQuery,
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(perPage);
  const limit = parseInt(perPage);

  const [transactions, totalCount] = await Promise.all([
    Product.find(query).skip(skip).limit(limit),
    Product.countDocuments(query),
  ]);

  return {
    transactions,
    page: parseInt(page),
    perPage: limit,
    totalRecords: totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
};

const fetchStatistics = async (month) => {
  const monthIndex = getMonthIndex(month);
  const matchStage = {
    $match: {
      $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex] },
    },
  };

  const [saleStats] = await Product.aggregate([
    matchStage,
    {
      $group: {
        _id: null,
        totalSaleAmount: {
          $sum: { $cond: [{ $eq: ["$sold", true] }, "$price", 0] },
        },
        soldItems: {
          $sum: { $cond: [{ $eq: ["$sold", true] }, 1, 0] },
        },
        notSoldItems: {
          $sum: { $cond: [{ $eq: ["$sold", false] }, 1, 0] },
        },
      },
    },
  ]);

  return {
    totalSaleAmount: saleStats?.totalSaleAmount || 0,
    soldItems: saleStats?.soldItems || 0,
    notSoldItems: saleStats?.notSoldItems || 0,
  };
};

const fetchBarChartData = async (month) => {
  const monthIndex = getMonthIndex(month);
  const monthFilter = {
    $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex] },
  };

  const result = await Promise.all(
    PRICE_RANGES.map(async ({ min, max }) => {
      const query = {
        $and: [
          monthFilter,
          {
            price: {
              $gte: min,
              $lt: max === Infinity ? 1000000 : max,
            },
          },
        ],
      };

      const count = await Product.countDocuments(query);

      return {
        range: max === Infinity ? `${min}-above` : `${min}-${max}`,
        count,
      };
    })
  );

  return result;
};

const fetchPieChartData = async (month) => {
  const monthIndex = getMonthIndex(month);

  const categoryStats = await Product.aggregate([
    {
      $match: {
        $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex] },
      },
    },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  return categoryStats.map((stat) => ({
    category: stat._id,
    items: stat.count,
  }));
};

export const initializeDatabase = async (req, res) => {
  try {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );

    await Product.deleteMany({});

    const formattedProducts = response.data.map((product) => ({
      ...product,
      dateOfSale: new Date(product.dateOfSale),
    }));

    await Product.insertMany(formattedProducts);
    return res
      .status(200)
      .json({ message: "Database initialized successfully" });
  } catch (error) {
    return handleError(res, "Error initializing database", error);
  }
};

export const listTransactions = async (req, res) => {
  try {
    const result = await fetchTransactions(
      req.query.month,
      req.query.search,
      req.query.page,
      req.query.perPage
    );
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, "Error fetching transactions", error);
  }
};

export const getStatistics = async (req, res) => {
  try {
    const result = await fetchStatistics(req.query.month);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, "Error fetching statistics", error);
  }
};

export const getBarChartData = async (req, res) => {
  try {
    const result = await fetchBarChartData(req.query.month);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, "Error fetching bar chart data", error);
  }
};

export const getPieChartData = async (req, res) => {
  try {
    const result = await fetchPieChartData(req.query.month);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, "Error fetching pie chart data", error);
  }
};

export const getCombinedData = async (req, res) => {
  try {
    const { month, search, page, perPage } = req.query;

    console.log("Received query params:", {
      month,
      search,
      page,
      perPage,
    });

    const [transactions, statistics, barChart, pieChart] = await Promise.all([
      fetchTransactions(month, search, page, perPage),
      fetchStatistics(month),
      fetchBarChartData(month),
      fetchPieChartData(month),
    ]);

    return res.status(200).json({
      transactions,
      statistics,
      barChart,
      pieChart,
    });
  } catch (error) {
    return handleError(res, "Error fetching combined data", error);
  }
};
