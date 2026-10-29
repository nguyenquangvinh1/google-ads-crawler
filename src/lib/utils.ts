import { format, subDays } from "date-fns";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function getDateRange(range: string): { startDate: string; endDate: string } {
  const today = new Date();
  const endDate = format(today, "yyyy-MM-dd");

  let startDate: string;
  switch (range) {
    case "7d":
      startDate = format(subDays(today, 7), "yyyy-MM-dd");
      break;
    case "14d":
      startDate = format(subDays(today, 14), "yyyy-MM-dd");
      break;
    case "30d":
      startDate = format(subDays(today, 30), "yyyy-MM-dd");
      break;
    case "90d":
      startDate = format(subDays(today, 90), "yyyy-MM-dd");
      break;
    default:
      startDate = format(subDays(today, 7), "yyyy-MM-dd");
  }

  return { startDate, endDate };
}

export function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case "ENABLED":
      return "var(--color-success)";
    case "PAUSED":
      return "var(--color-warning)";
    case "REMOVED":
      return "var(--color-error)";
    default:
      return "var(--color-text-secondary)";
  }
}

export function getStatusLabel(status: string): string {
  switch (status.toUpperCase()) {
    case "ENABLED":
      return "Đang chạy";
    case "PAUSED":
      return "Tạm dừng";
    case "REMOVED":
      return "Đã xoá";
    default:
      return status;
  }
}
