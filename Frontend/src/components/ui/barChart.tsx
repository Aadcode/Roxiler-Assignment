import { useEffect, useState } from "react";
import apiClient from "@/utils";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface ChartProps {
  selectedMonth: string;
}
interface ChartDataResponse {
  name: string;
  total: number;
}

export function Chart({ selectedMonth }: ChartProps) {
  const [chartData, setChartData] = useState<ChartDataResponse[]>([]);

  useEffect(() => {
    const barGraphData = async () => {
      try {
        const response = await apiClient.get("bar-chart", {
          params: { month: selectedMonth },
        });
        console.log(response.data.data);
        setChartData(response.data.data);
      } catch (error) {
        console.error("Error fetching bar chart data:", error);
      }
    };
    barGraphData();
  }, [selectedMonth]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary "
          barSize={30}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
