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

import { InputWithButton } from "./InputwithButtons";
import { Button } from "./ui/button";
import { Chart } from "./ui/barChart";

const Dashboard = () => {
  return (
    <div>
      <div className="flex justify-between p-5">
        <div>
          <InputWithButton></InputWithButton>
        </div>
        <div>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => {
                return <SelectItem value={month}>{month}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="p-5 m-5 border-2 border-black ">
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
            <TableRow>
              <TableCell className="font-medium">INV001</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Credit Card</TableCell>
              <TableCell>$250.00</TableCell>
              <TableCell>$250.00</TableCell>
              <TableCell>$250.00</TableCell>
              <TableCell>$250.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between p-5 px-10 ">
        <div className="text-center font-medium">Page No:{"1"}</div>
        <div className="flex gap-5">
          <Button>Previous</Button>
          <Button>Next</Button>
        </div>
        <div className="text-center font-medium">Per Page:{"10"}</div>
      </div>
      <div className="flex flex-col w-1/2 mx-auto  ">
        <div className="flex justify-between p-5 ">
          <div className="text-2xl font-semibold">Statistics</div>
          <div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => {
                  return <SelectItem value={month}>{month}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col mx-auto p-5 gap-2 rounded-md bg-yellow-200 w-full">
          <div>Total Sale :</div>
          <div>Total Sold Item :</div>
          <div>Total Not Sold Item :</div>
        </div>
      </div>
      <div className="mt-28 mb-16 w-1/2 mx-auto">
        <div className="flex justify-between p-5 ">
          <div className="text-2xl font-semibold">Statistics</div>
          <div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => {
                  return <SelectItem value={month}>{month}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Chart></Chart>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
