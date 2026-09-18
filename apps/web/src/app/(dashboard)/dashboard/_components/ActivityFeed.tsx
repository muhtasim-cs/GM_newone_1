import { TrendingUp } from "lucide-react";
import { formatCurrency, timeAgo, cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ActivityItem } from "@/types";
import { placeholderActivity } from "../_hooks/useDashboardData";

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  const allItems = items.length ? items : placeholderActivity;
  const dealItems = items.filter((a) => a.type === "DEAL").length
    ? items.filter((a) => a.type === "DEAL")
    : placeholderActivity.slice(0, 2);
  const paymentItems = items.filter((a) => a.type === "PAYMENT" || a.type === "DISTRIBUTION").length
    ? items.filter((a) => a.type === "PAYMENT" || a.type === "DISTRIBUTION")
    : placeholderActivity.slice(1, 3);

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions across your account</CardDescription>
        </div>
        <Tabs defaultValue="all">
          <TabsList className="h-8">
            <TabsTrigger value="all" className="h-7 px-2 text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="deals" className="h-7 px-2 text-xs">
              Deals
            </TabsTrigger>
            <TabsTrigger value="payments" className="h-7 px-2 text-xs">
              Payments
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="mt-2">
          <TabsContent value="all" className="mt-0">
            <ActivityList items={allItems} />
          </TabsContent>
          <TabsContent value="deals" className="mt-0">
            <ActivityList items={dealItems} />
          </TabsContent>
          <TabsContent value="payments" className="mt-0">
            <ActivityList items={paymentItems} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ActivityList({
  items,
}: {
  items: Array<{
    title: string;
    description: string;
    createdAt: string;
    type: string;
    amount?: number;
  }>;
}) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <div
          key={item.title + item.createdAt}
          className="flex items-center justify-between gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/60"
        >
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                item.type === "DISTRIBUTION" || item.type === "PAYMENT"
                  ? "bg-success/10 text-success"
                  : "bg-primary/10 text-primary",
              )}
            >
              <TrendingUp className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            {item.amount !== undefined && (
              <p className="text-sm font-semibold">{formatCurrency(item.amount)}</p>
            )}
            <p className="text-xs text-muted-foreground">{timeAgo(item.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
