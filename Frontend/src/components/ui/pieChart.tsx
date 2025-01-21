import { LabelList, Pie, PieChart } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import apiClient from "@/utils";
import { useEffect, useState } from "react";

interface ChartProps {
  selectedMonth: string;
}

interface ChartDataResponse {
  category: string;
  count: number;
}

export function Component({ selectedMonth }: ChartProps) {
  const [chartData, setChartData] = useState<ChartDataResponse[]>([]);

  useEffect(() => {
    const pieChartData = async () => {
      try {
        const response = await apiClient.get("/pie-chart", {
          params: { month: selectedMonth },
        });
        console.log(response.data.data);
        setChartData(response.data.data);
      } catch (error) {
        console.error("Error fetching bar chart data:", error);
      }
    };
    pieChartData();
  }, [selectedMonth]);

  return (
    <Card className="flex flex-col">
      <CardContent className="flex-1 pb-0">
        <div className="mx-auto aspect-square max-h-[250px]">
          <PieChart width={250} height={250}>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
            >
              <LabelList dataKey="category" stroke="none" fontSize={12} />
            </Pie>
          </PieChart>
        </div>
      </CardContent>
    </Card>
  );
}
