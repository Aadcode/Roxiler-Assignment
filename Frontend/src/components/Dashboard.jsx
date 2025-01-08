import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";

const API_BASE_URL = "http://localhost:3000/api/v1";
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

const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState("March");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState({
    transactions: false,
    statistics: false,
    charts: false,
  });
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    transactions: {
      transactions: [],
      totalPages: 1,
      totalRecords: 0,
    },
    statistics: {
      totalSaleAmount: 0,
      soldItems: 0,
      notSoldItems: 0,
    },
    barChart: [],
    pieChart: [],
  });

  const formatNumber = (num) => new Intl.NumberFormat("en-US").format(num);

  const fetchData = useCallback(
    async (searchValue) => {
      try {
        setSectionLoading({
          transactions: true,
          statistics: true,
          charts: true,
        });
        setError(null);

        const params = new URLSearchParams({
          month: selectedMonth,
          search: searchValue,
          page: page.toString(),
          perPage: "10",
        });

        const response = await fetch(`${API_BASE_URL}/combined-data?${params}`);
        if (!response.ok) throw new Error("Network response was not ok");

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err.message || "An error occurred while fetching data");
        throw new Error(error);
      } finally {
        setSectionLoading({
          transactions: false,
          statistics: false,
          charts: false,
        });
        setLoading(false);
      }
    },
    [selectedMonth, page, error]
  );

  const debouncedSearchHandler = useCallback(
    debounce((value) => setDebouncedSearch(value), 500),
    []
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearchHandler(value);
    setPage(1);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setPage(1);
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );

  useEffect(() => {
    fetchData(debouncedSearch);
  }, [debouncedSearch, selectedMonth, page, fetchData]);

  const initializeDatabase = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/initialize`);
      if (!response.ok) throw new Error("Failed to initialize database");
      await fetchData(debouncedSearch);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Error initializing database");
      throw new Error(Error);
    }
  };

  if (
    loading &&
    !sectionLoading.transactions &&
    !sectionLoading.statistics &&
    !sectionLoading.charts
  ) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Transaction Dashboard
          </h1>
          <button
            onClick={initializeDatabase}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reset Database
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="block w-full rounded-md border-gray-300 shadow-sm p-2 bg-white"
          >
            {MONTHS.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search transactions..."
            value={searchText}
            onChange={handleSearch}
            className="block w-full rounded-md border-gray-300 shadow-sm p-2"
          />
        </div>

        <div className="mb-6">
          {sectionLoading.statistics ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Total Sale Amount
                </h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  ${formatNumber(data.statistics.totalSaleAmount || 0)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Total Sold Items
                </h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {formatNumber(data.statistics.soldItems || 0)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Total Not Sold Items
                </h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {formatNumber(data.statistics.notSoldItems || 0)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          {sectionLoading.transactions ? (
            <LoadingSpinner />
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.transactions.transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${transaction.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.sold ? "Yes" : "No"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.dateOfSale).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {page} of {data.transactions.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= data.transactions.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sectionLoading.charts ? (
            <>
              <LoadingSpinner />
              <LoadingSpinner />
            </>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Price Range Distribution
                </h3>
                <div className="space-y-4">
                  {data.barChart.map((item) => (
                    <div
                      key={item.range}
                      className="relative pt-1"
                      title={`${item.range}: ${item.count} items`}
                    >
                      <div className="flex mb-2 items-center justify-between">
                        <div className="text-sm font-semibold text-gray-700">
                          {item.range}
                        </div>
                        <div className="text-sm font-semibold text-gray-700">
                          {item.count} items
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
                        <div
                          style={{
                            width: `${
                              (item.count /
                                Math.max(
                                  ...data.barChart.map((i) => i.count)
                                )) *
                              100
                            }%`,
                          }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Category Distribution
                </h3>
                <div className="space-y-4">
                  {data.pieChart.map((item, index) => {
                    const colors = [
                      "bg-red-500",
                      "bg-blue-500",
                      "bg-yellow-500",
                      "bg-green-500",
                      "bg-purple-500",
                      "bg-orange-500",
                    ];
                    const total =
                      data.pieChart.reduce((sum, i) => sum + i.items, 0) || 1;
                    const percentage = ((item.items / total) * 100).toFixed(1);

                    return (
                      <div key={item.category} className="flex items-center">
                        <div
                          className={`w-4 h-4 ${
                            colors[index % colors.length]
                          } rounded-full mr-2`}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              {item.category}
                            </span>
                            <span className="text-sm text-gray-500">
                              {item.items} items ({percentage}%)
                            </span>
                          </div>
                          <div className="mt-1 overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                            <div
                              className={`${colors[index % colors.length]}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
