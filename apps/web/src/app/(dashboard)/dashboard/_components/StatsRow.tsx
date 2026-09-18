import { ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatCardItem } from "../_hooks/useDashboardData";

interface StatsRowProps {
  cards: StatCardItem[];
}

export function StatsRow({ cards }: StatsRowProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((s) => (
        <Card key={s.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {s.label}
            </CardTitle>
            <s.icon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof s.value === "number"
                ? s.label.toLowerCase().includes("return") ||
                  s.label.toLowerCase().includes("revenue") ||
                  s.label.toLowerCase().includes("portfolio") ||
                  s.label.toLowerCase().includes("invested")
                  ? formatCurrency(s.value)
                  : s.value.toLocaleString()
                : "-"}
            </div>
            <div className="flex items-center gap-1 pt-1 text-xs text-success">
              <ArrowUpRight className="h-3 w-3" />
              +12.5% vs last quarter
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
