import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, AlertTriangle, Eye } from "lucide-react";

interface BookingStatusBadgeProps {
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  showIcon?: boolean;
}

export function BookingStatusBadge({
  status,
  showIcon = false,
}: BookingStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          variant: "default" as const,
          label: "Confirmed",
          icon: CheckCircle,
          className: "bg-green-500/20 text-green-600 border-2 border-green-500",
        };
      case "pending":
        return {
          variant: "secondary" as const,
          label: "Pending",
          icon: Clock,
          className: "bg-amber-500/20 text-amber-600 border-2 border-amber-500",
        };
      case "cancelled":
        return {
          variant: "destructive" as const,
          label: "Cancelled",
          icon: XCircle,
          className: "bg-red-500/20 text-red-600 border-2 border-red-500",
        };
      case "completed":
        return {
          variant: "default" as const,
          label: "Completed",
          icon: CheckCircle,
          className:
            "bg-emerald-500/20 text-emerald-600 border-2 border-emerald-500",
        };
      case "no_show":
        return {
          variant: "outline" as const,
          label: "No Show",
          icon: AlertTriangle,
          className: "bg-gray-500/20 text-gray-600 border-2 border-gray-500",
        };
      default:
        return {
          variant: "secondary" as const,
          label: "Unknown",
          icon: Eye,
          className: "bg-slate-500/20 text-slate-600 border-2 border-slate-500",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      {showIcon && <Icon className="w-4 h-4 mr-1" />}
      {config.label}
    </Badge>
  );
}
