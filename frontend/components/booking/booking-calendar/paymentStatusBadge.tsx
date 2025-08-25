import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, XCircle, RotateCcw } from "lucide-react";

interface PaymentStatusBadgeProps {
  status: "pending" | "completed" | "failed" | "refunded" | "partial_refund";
  showIcon?: boolean;
}

export function PaymentStatusBadge({
  status,
  showIcon = false,
}: PaymentStatusBadgeProps) {
  const getPaymentConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          variant: "default" as const,
          label: "Paid",
          icon: DollarSign,
          className: "bg-green-500/20 text-green-600 border-2 border-green-500",
        };
      case "pending":
        return {
          variant: "secondary" as const,
          label: "Pending",
          icon: Clock,
          className: "bg-amber-500/20 text-amber-600 border-2 border-amber-500",
        };
      case "failed":
        return {
          variant: "destructive" as const,
          label: "Failed",
          icon: XCircle,
          className: "bg-red-500/20 text-red-600 border-2 border-red-500",
        };
      case "refunded":
        return {
          variant: "outline" as const,
          label: "Refunded",
          icon: RotateCcw,
          className: "bg-blue-500/20 text-blue-600 border-2 border-blue-500",
        };
      case "partial_refund":
        return {
          variant: "outline" as const,
          label: "Partial Refund",
          icon: RotateCcw,
          className:
            "bg-indigo-500/20 text-indigo-600 border-2 border-indigo-500",
        };
      default:
        return {
          variant: "secondary" as const,
          label: "Unknown",
          icon: Clock,
          className: "bg-slate-500/20 text-slate-600 border-2 border-slate-500",
        };
    }
  };

  const config = getPaymentConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      {showIcon && <Icon className="w-4 h-4 mr-1" />}
      {config.label}
    </Badge>
  );
}
