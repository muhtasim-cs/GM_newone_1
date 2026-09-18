import Link from "next/link";
import {
  PlusCircle,
  Handshake,
  FolderKanban,
  FileText,
  Wallet as WalletIcon,
  TrendingUp,
  Sprout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { Role } from "@/types";

interface QuickActionsCardProps {
  role: Role;
}

export function QuickActionsCard({ role }: QuickActionsCardProps) {
  const actions = getQuickActions(role);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Jump into common tasks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="w-full justify-start gap-2"
            asChild
          >
            <Link href={action.href}>
              <action.icon className="h-4 w-4 text-primary" />
              {action.label}
            </Link>
          </Button>
        ))}
        <Separator className="my-3" />
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Renewable Energy Farms
          </p>
          <Progress value={72} className="h-2" />
          <p className="mt-1.5 text-xs text-muted-foreground">72% of season goal met</p>
        </div>
      </CardContent>
    </Card>
  );
}

function getQuickActions(role: Role) {
  if (role === "FARMER") {
    return [
      { label: "Create a new project", href: "/dashboard/projects/new", icon: PlusCircle },
      { label: "List a deal", href: "/dashboard/deals/new", icon: Handshake },
      { label: "Upload documents", href: "/dashboard/documents", icon: FileText },
      { label: "View platform deals", href: "/dashboard/deals", icon: FolderKanban },
    ];
  }
  if (role === "INVESTOR") {
    return [
      { label: "Browse open deals", href: "/dashboard/deals", icon: Handshake },
      { label: "View my investments", href: "/dashboard/investments", icon: WalletIcon },
      { label: "Review portfolio", href: "/dashboard/portfolio", icon: TrendingUp },
      { label: "Upload documents", href: "/dashboard/documents", icon: FileText },
    ];
  }
  return [
    { label: "Approve pending deals", href: "/dashboard/deals", icon: Handshake },
    { label: "Verify farmers", href: "/dashboard/farmers", icon: Sprout },
    { label: "Review payments", href: "/dashboard/payments", icon: WalletIcon },
    { label: "View blockchain records", href: "/dashboard/blockchain", icon: FolderKanban },
  ];
}
