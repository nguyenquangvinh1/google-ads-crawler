import { NextRequest, NextResponse } from "next/server";
import {
  getCampaignPerformance,
  getKeywordPerformance,
  getSearchTermsReport,
  getConversions,
  getAdGroupPerformance,
} from "@/lib/google-ads";
import { getDateRange } from "@/lib/utils";
import { AdsAuthError } from "@/lib/ads-session";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";
    const type = searchParams.get("type") || "campaigns";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    let startDate: string, endDate: string;
    if (customStart && customEnd) {
      startDate = customStart;
      endDate = customEnd;
    } else {
      const dates = getDateRange(range);
      startDate = dates.startDate;
      endDate = dates.endDate;
    }

    let data: Record<string, unknown>[];
    switch (type) {
      case "campaigns":
        data = (await getCampaignPerformance(startDate, endDate)) as unknown as Record<string, unknown>[];
        break;
      case "keywords":
        data = (await getKeywordPerformance(startDate, endDate)) as unknown as Record<string, unknown>[];
        break;
      case "search-terms":
        data = (await getSearchTermsReport(startDate, endDate)) as unknown as Record<string, unknown>[];
        break;
      case "conversions":
        data = (await getConversions(startDate, endDate)) as unknown as Record<string, unknown>[];
        break;
      case "ad-groups":
        data = (await getAdGroupPerformance(startDate, endDate)) as unknown as Record<string, unknown>[];
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Convert to CSV
    if (!data || data.length === 0) {
      return new NextResponse("No data available", { status: 404 });
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((h) => {
            const val = String(row[h] ?? "");
            return val.includes(",") ? `"${val}"` : val;
          })
          .join(",")
      ),
    ];
    const csv = csvRows.join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=google-ads-${type}-${startDate}-to-${endDate}.csv`,
      },
    });
  } catch (error: unknown) {
    const authError = error instanceof AdsAuthError || (error instanceof Error && error.message.includes("invalid_grant"));
    return NextResponse.json({ error: authError ? "Vui lòng kết nối lại Google Ads hoặc chọn tài khoản" : "Không thể xuất báo cáo Google Ads" }, { status: authError ? 401 : 502 });
  }
}
