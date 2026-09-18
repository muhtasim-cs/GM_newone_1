import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_COLORS, type PlaceholderSlice } from "../_hooks/useDashboardData";

interface InvestmentBreakdownChartProps {
  data: PlaceholderSlice[];
}

export function InvestmentBreakdownChart({ data }: InvestmentBreakdownChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Breakdown</CardTitle>
        <CardDescription>By sector allocation</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius="55%"
              outerRadius="82%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((_: PlaceholderSlice, i: number) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [formatCurrency(Number(value)), name]}
              contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
            />
            <Legend
              verticalAlign="bottom"
              height={28}
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span className="text-xs text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
