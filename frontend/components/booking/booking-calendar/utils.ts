export const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "#22c55e";
    case "pending":
      return "#eab308";
    case "cancelled":
      return "#ef4444";
    case "completed":
      return "#06b6d4";
    case "no_show":
      return "#6b7280";
    default:
      return "#3b82f6";
  }
};

export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "completed":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "no_show":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    default:
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
  }
};

export const calculateDuration = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
};
