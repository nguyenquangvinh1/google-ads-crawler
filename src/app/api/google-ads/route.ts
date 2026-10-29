import { NextRequest, NextResponse } from "next/server";
import {
  getCampaignPerformance,
  getKeywordPerformance,
  getSearchTermsReport,
  getConversions,
  getAdGroupPerformance,
  getAccountSummary,
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

    let data;
    switch (type) {
      case "campaigns":
        data = await getCampaignPerformance(startDate, endDate);
        break;
      case "keywords":
        data = await getKeywordPerformance(startDate, endDate);
        break;
      case "search-terms":
        data = await getSearchTermsReport(startDate, endDate);
        break;
      case "conversions":
        data = await getConversions(startDate, endDate);
        break;
      case "ad-groups":
        data = await getAdGroupPerformance(startDate, endDate);
        break;
      case "summary":
        data = await getAccountSummary(startDate, endDate);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid type parameter" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data,
      meta: { startDate, endDate, type, count: Array.isArray(data) ? data.length : 1 },
    });
  } catch (error: unknown) {
    const authError =
      error instanceof AdsAuthError ||
      (error instanceof Error && error.message.includes("invalid_grant"));
    const failure =
      typeof error === "object" && error !== null
        ? (error as Record<string, unknown>)
        : {};
    const googleAdsErrors = Array.isArray(failure.errors)
      ? failure.errors.flatMap((item: unknown) => {
          if (typeof item !== "object" || item === null) return [];

          const detail = item as Record<string, unknown>;
          const errorCode = detail.error_code;
          if (typeof errorCode !== "object" || errorCode === null) return [];

          return Object.entries(errorCode)
            .filter(
              ([, value]) =>
                typeof value === "string" || typeof value === "number"
            )
            .map(([category, code]) => ({ category, code }));
        })
      : [];

    console.error("[Google Ads] Không tải được báo cáo", {
      authError,
      errorType: error instanceof Error ? error.name : typeof error,
      codes: googleAdsErrors,
      statusCode:
        typeof failure.code === "number" ? failure.code : undefined,
    });

    const message = authError ? "Vui lòng kết nối lại Google Ads hoặc chọn tài khoản" : "Không tải được báo cáo Google Ads. Kiểm tra quyền tài khoản và cấu hình API của công ty.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: authError ? 401 : 502 }
    );
  }
}
