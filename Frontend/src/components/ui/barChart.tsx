import { useEffect, useState } from "react";
import apiClient from "@/utils";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface ChartProps {
  selectedMonth: string;
}

interface ChartDataResponse {
  name: string;
  total: number;
}

export function Chart({ selectedMonth }: ChartProps) {
  const [chartData, setChartData] = useState<ChartDataResponse[]>([]);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const barGraphData = async () => {
      try {
        const response = await apiClient.get("bar-chart", {
          params: { month: selectedMonth },
        });
        setChartData(response.data.data);
      } catch (error) {
        console.error("Error fetching bar chart data:", error);
      }
    };
    barGraphData();

    // Add resize handler
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedMonth]);

  // Responsive configurations based on screen width
  const getConfig = () => {
    if (screenWidth < 480) {
      // Mobile
      return {
        barSize: 8,
        fontSize: 10,
        xAxisHeight: 80,
        yAxisWidth: 30,
        labelAngle: -45,
        margin: { top: 20, right: 10, bottom: 50, left: 10 },
      };
    } else if (screenWidth < 768) {
      // Tablet
      return {
        barSize: 12,
        fontSize: 11,
        xAxisHeight: 70,
        yAxisWidth: 35,
        labelAngle: -30,
        margin: { top: 20, right: 20, bottom: 40, left: 20 },
      };
    } else {
      // Desktop
      return {
        barSize: 15,
        fontSize: 12,
        xAxisHeight: 60,
        yAxisWidth: 40,
        labelAngle: 0,
        margin: { top: 20, right: 30, bottom: 20, left: 30 },
      };
    }
  };

  const config = getConfig();

  return (
    <div className="w-full h-full min-h-[350px] p-2 md:p-4">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={config.margin}>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={config.fontSize}
            tickLine={false}
            axisLine={false}
            height={config.xAxisHeight}
            interval={0}
            angle={config.labelAngle}
            textAnchor={config.labelAngle !== 0 ? "end" : "middle"}
            dy={config.labelAngle !== 0 ? 10 : 0}
          />
          <YAxis
            stroke="#888888"
            fontSize={config.fontSize}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            width={config.yAxisWidth}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              border: "none",
              borderRadius: "4px",
              color: "white",
              fontSize: config.fontSize,
            }}
            cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
          />
          <Legend
            wrapperStyle={{
              fontSize: config.fontSize,
              paddingTop: "10px",
            }}
          />
          <Bar
            dataKey="total"
            fill="currentColor"
            radius={[4, 4, 0, 0]}
            className="fill-primary"
            barSize={config.barSize}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Chart;
