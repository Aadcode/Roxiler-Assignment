import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { months } from "@/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { Chart } from "./ui/barChart";
import { InputWithButton } from "./ui/InputwithButtons";
import { useToast } from "@/hooks/use-toast";
import apiClient from "../utils";

interface Transaction {
  _id: string;
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  sold: boolean;
  dateOfSale: string;
  __v: number;
}

interface Pagination {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

interface Statistics {
  soldItemsCount: number;
  notSoldItemsCount: number;
  totalItems: number;
  totalRevenue: number;
}

const Dashboard = () => {
  const [month, setMonth] = useState<string>("March");
  const [search, setSearch] = useState<string>("");
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [page, setPage] = useState<number>(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [transactionsRes, statisticsRes] = await Promise.all([
        apiClient.get("/transactions", {
          params: { month, search, page },
        }),
        apiClient.get("/statistics", {
          params: { month },
        }),
      ]);

      setTransactions(transactionsRes.data.data || []);
      setPagination(transactionsRes.data.pagination);
      setStatistics(statisticsRes.data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while fetching data";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, month, search, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInitialize = async () => {
    try {
      const response = await apiClient.get("/initialize");
      setIsInitialized(true);
      toast({
        title: "Success",
        description: response.data.message,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initialize database";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const renderStatisticsCard = (label: string, value: number | string) => (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
      <span className="font-bold text-lg md:text-xl">{label}</span>
      <span className="text-lg">{value}</span>
    </div>
  );

  return (
    <div className="p-2 md:p-4 lg:p-6 bg-black text-white min-h-screen">
      {/* Controls Section */}
      <div className="flex flex-col md:flex-row justify-between gap-4 p-2 md:p-5">
        <Button onClick={handleInitialize} disabled={isInitialized}>
          {isInitialized ? "Database Initialized" : "Initialize Database"}
        </Button>
        <div className="w-full md:w-auto">
          <InputWithButton
            placeholder="Search Transactions"
            type="text"
            onchange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
          />
        </div>
        <Select onValueChange={setMonth} defaultValue="March">
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 mb-4 text-red-500 bg-red-100 rounded">{error}</div>
      )}

      {/* Transactions Table */}
      <div className="p-2 md:p-5 m-2 md:m-5 border border-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[50px]">ID</TableHead>
              <TableHead className="min-w-[120px]">Title</TableHead>
              <TableHead className="min-w-[200px]">Description</TableHead>
              <TableHead className="min-w-[80px]">Price</TableHead>
              <TableHead className="min-w-[100px]">Category</TableHead>
              <TableHead className="min-w-[60px]">Sold</TableHead>
              <TableHead className="min-w-[80px]">Image</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    Loading transactions...
                  </div>
                </TableCell>
              </TableRow>
            ) : transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell className="break-words">
                    {transaction.title}
                  </TableCell>
                  <TableCell className="break-words">
                    {transaction.description}
                  </TableCell>
                  <TableCell>${transaction.price.toFixed(2)}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.sold ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <img
                      src={transaction.image}
                      alt={transaction.title}
                      className="w-10 h-10 object-cover rounded"
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col md:flex-row items-center justify-between p-2 md:p-5 gap-4">
          <div className="text-center font-medium">
            Page {page} of {pagination.total_pages}
          </div>
          <div className="flex gap-2 md:gap-5">
            <Button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <Button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === pagination.total_pages || loading}
            >
              Next
            </Button>
          </div>
          <div className="text-center font-medium">
            Showing {pagination.per_page} items per page
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="flex flex-col w-full lg:w-2/3 mx-auto mt-10 px-2">
          <div className="flex justify-between p-2 md:p-5">
            <div className="text-xl md:text-2xl font-semibold">Statistics</div>
          </div>
          <div className="flex flex-col mx-auto p-4 md:p-5 gap-2 rounded-md bg-yellow-200 w-full text-black">
            {renderStatisticsCard(
              "Total Sales",
              `$${statistics.totalRevenue.toFixed(2)}`
            )}
            {renderStatisticsCard(
              "Total Sold Items",
              statistics.soldItemsCount
            )}
            {renderStatisticsCard(
              "Total Not Sold Items",
              statistics.notSoldItemsCount
            )}
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="mt-10 mb-16 w-full lg:w-3/4 mx-auto p-4 md:p-10">
        <div className="flex justify-between mb-8 md:mb-16">
          <div className="text-xl md:text-2xl font-semibold">
            Monthly Trends
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <Chart selectedMonth={month} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
