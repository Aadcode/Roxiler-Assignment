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

import apiClient from "../utils";
import { InputWithButton } from "./InputwithButtons";
import { Button } from "./ui/button";
import { Chart } from "./ui/barChart";
import { useEffect, useState } from "react";

interface Transaction {
  _id: string;
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  sold: boolean;
  dateOfSale: string; // ISO string
  __v: number;
}

interface pagination {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

interface statisticsInterface {
  soldItemsCount: number;
  notSoldItemsCount: number;
  totalItems: number;
  totalRevenue: number;
}

const Dashboard = () => {
  const [month, setMonth] = useState<string>("March");
  const [search, setSearch] = useState<string>("");
  const [statistics, setstatistics] = useState<statisticsInterface>();
  const [page, setPage] = useState<number>(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setpagination] = useState<pagination>();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const transactions = await apiClient.get("/transactions", {
          params: { month, search, page },
        });
        setTransactions(transactions.data.data || []);
        setpagination(transactions.data.pagination);
        const statisticsResponse = await apiClient("/statistics", {
          params: { month },
        });
        setstatistics(statisticsResponse.data.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [month, search, page]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className="p-2 bg-black text-white">
      <div className="flex justify-between p-5">
        <div>
          <InputWithButton
            placeholder="Search Transactions"
            type="text"
            onchange={handleSearch}
          />
        </div>
        <div>
          <Select onValueChange={(value) => setMonth(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="March" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="p-5 m-5 border border-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Sold</TableHead>
              <TableHead>Image</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>{transaction.title}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>${transaction.price}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.sold ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <img
                      src={transaction.image}
                      alt="Product"
                      className="w-10 h-10 object-cover"
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between p-5 px-10 ">
        <div className="text-center font-medium">Page No: {page}</div>
        <div className="flex gap-5">
          <Button
            onClick={() => setPage((page) => page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            onClick={() => setPage((page) => page + 1)}
            disabled={page === pagination?.total_pages}
          >
            Next
          </Button>
        </div>
        <div className="text-center font-medium">Per Page: 10</div>
      </div>

      <div className="flex flex-col w-1/2 mx-auto mt-10">
        <div className="flex justify-between p-5">
          <div className="text-2xl font-semibold">Statistics</div>
        </div>
        <div className="flex flex-col mx-auto p-5 gap-2 rounded-md bg-yellow-200 w-full text-black">
          <div>
            <span className="font-bold text-xl">Total Sales</span>:{" "}
            <span className="text-lg ">{statistics?.totalRevenue}</span>
          </div>
          <div>
            <span className="font-bold text-xl">Total Sold Item</span> :
            <span className="text-lg "> {statistics?.soldItemsCount}</span>
          </div>
          <div className="text-xl">
            <span className="font-bold text-xl">Total Not Sold Item</span> :{" "}
            <span className="text-lg ">{statistics?.notSoldItemsCount}</span>
          </div>
        </div>
      </div>
      <div className="mt-10 mb-16 w-3/4 mx-auto p-10">
        <div className="flex justify-between mb-16">
          <div className="text-2xl font-semibold">Statistics</div>
        </div>
        <div>
          <Chart selectedMonth={month}></Chart>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
