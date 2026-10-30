"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdsConnection from "./ads-connection";
import {
  BarChart3,
  Search,
  Download,
  RefreshCw,
  TrendingUp,
  MousePointerClick,
  DollarSign,
  Target,
  LayoutDashboard,
  FileText,
  Megaphone,
  Hash,
  AlertCircle,
  Layers,
  Settings,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

type TabType = "campaigns" | "keywords" | "search-terms" | "conversions" | "ad-groups";
type DateRange = "7d" | "14d" | "30d" | "90d";

interface SummaryData {
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
}

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#3b82f6", "#60a5fa", "#10b981", "#34d399"];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("campaigns");
  const [dateRange, setDateRange] = useState<DateRange>("7d");
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sessionResponse = await fetch("/api/ads-auth/session");
      const session = await sessionResponse.json();
      if (!sessionResponse.ok || !session.customerId) {
        setData([]);
        setSummary(null);
        setIsConfigured(false);
        return;
      }
      const [dataRes, summaryRes] = await Promise.all([
        fetch(`/api/google-ads?type=${activeTab}&range=${dateRange}`),
        fetch(`/api/google-ads?type=summary&range=${dateRange}`),
      ]);

      const dataJson = await dataRes.json();
      const summaryJson = await summaryRes.json();

      if (dataRes.status === 401 || summaryRes.status === 401) {
        setData([]);
        setSummary(null);
        setIsConfigured(false);
        return;
      }

      if (!dataJson.success) {
        const codes = Array.isArray(dataJson.codes)
          ? dataJson.codes.map((detail: { category: string; code: string | number }) => `${detail.category}: ${detail.code}`).join(", ")
          : "";
        throw new Error(`${dataJson.error || "Failed to fetch data"}${codes ? ` (${codes})` : ""}`);
      }

      setData(dataJson.data);
      if (summaryJson.success) {
        setSummary(summaryJson.data);
      }
      setIsConfigured(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      if (message.includes("credentials") || message.includes("GOOGLE_ADS")) {
        setIsConfigured(false);
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    const url = `/api/google-ads/export?type=${activeTab}&range=${dateRange}`;
    window.open(url, "_blank");
  };

  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(item).some((val) =>
      String(val).toLowerCase().includes(q)
    );
  });

  // Aggregate chart data by campaign name
  const chartData = (() => {
    if (activeTab !== "campaigns" || !data.length) return [];
    const aggregated = new Map<string, { name: string; clicks: number; impressions: number; cost: number; conversions: number }>();
    for (const row of data) {
      const name = String((row as Record<string, unknown>).name || "Unknown");
      const existing = aggregated.get(name) || { name, clicks: 0, impressions: 0, cost: 0, conversions: 0 };
      existing.clicks += Number((row as Record<string, unknown>).clicks || 0);
      existing.impressions += Number((row as Record<string, unknown>).impressions || 0);
      existing.cost += Number((row as Record<string, unknown>).cost || 0);
      existing.conversions += Number((row as Record<string, unknown>).conversions || 0);
      aggregated.set(name, existing);
    }
    return Array.from(aggregated.values())
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);
  })();

  const pieData = (() => {
    if (!data.length) return [];
    const costByCampaign = new Map<string, number>();
    for (const row of data) {
      const name = String((row as Record<string, unknown>).name || (row as Record<string, unknown>).campaignName || "Other");
      const cost = Number((row as Record<string, unknown>).cost || 0);
      costByCampaign.set(name, (costByCampaign.get(name) || 0) + cost);
    }
    return Array.from(costByCampaign.entries())
      .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 20) + "…" : name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  })();

  if (isConfigured === false) {
    return <SetupGuide />;
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">GA</div>
          <div>
            <h1>Ads Crawler</h1>
            <span>Google Ads Data</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Báo cáo</div>
          {([
            { key: "campaigns", label: "Chiến dịch", icon: <Megaphone size={18} /> },
            { key: "ad-groups", label: "Nhóm quảng cáo", icon: <Layers size={18} /> },
            { key: "keywords", label: "Từ khoá", icon: <Hash size={18} /> },
            { key: "search-terms", label: "Search Terms", icon: <Search size={18} /> },
            { key: "conversions", label: "Chuyển đổi / Leads", icon: <Target size={18} /> },
          ] as { key: TabType; label: string; icon: React.ReactNode }[]).map((item) => (
            <button
              key={item.key}
              className={`sidebar-link ${activeTab === item.key ? "active" : ""}`}
              onClick={() => setActiveTab(item.key)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <div className="sidebar-section-title" style={{ marginTop: 20 }}>Hệ thống</div>
          <button className="sidebar-link" onClick={() => setIsConfigured(false)}>
            <span className="icon"><Settings size={18} /></span>
            Kết nối / Đổi tài khoản
          </button>
          <Link className="sidebar-link" href="/about">
            Giới thiệu automatic-content
          </Link>
          <Link className="sidebar-link" href="/privacy">
            Chính sách quyền riêng tư
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="main-content">
        <header className="header">
          <h2 className="header-title">
            <LayoutDashboard size={20} style={{ marginRight: 8, opacity: 0.6 }} />
            {activeTab === "campaigns" && "Chiến dịch"}
            {activeTab === "ad-groups" && "Nhóm quảng cáo"}
            {activeTab === "keywords" && "Từ khoá"}
            {activeTab === "search-terms" && "Search Terms"}
            {activeTab === "conversions" && "Chuyển đổi / Leads"}
          </h2>
          <div className="header-actions">
            <div className="date-range-selector">
              {(["7d", "14d", "30d", "90d"] as DateRange[]).map((r) => (
                <button
                  key={r}
                  className={`date-range-btn ${dateRange === r ? "active" : ""}`}
                  onClick={() => setDateRange(r)}
                >
                  {r === "7d" ? "7 ngày" : r === "14d" ? "14 ngày" : r === "30d" ? "30 ngày" : "90 ngày"}
                </button>
              ))}
            </div>
            <button className="btn btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              Tải lại
            </button>
            <button className="btn btn-primary" onClick={handleExport}>
              <Download size={14} />
              Xuất CSV
            </button>
          </div>
        </header>

        <div className="page-content">
          {error && (
            <div className="error-banner fade-in">
              <AlertCircle size={18} className="error-banner-icon" />
              <div className="error-banner-text">
                <strong>Lỗi khi tải dữ liệu</strong>
                {error}
              </div>
            </div>
          )}

          {/* Summary Stats */}
          {summary && (
            <div className="stats-grid">
              <div className="stat-card accent fade-in">
                <div className="stat-card-header">
                  <span className="stat-card-label">Lượt hiển thị</span>
                  <div className="stat-card-icon accent"><TrendingUp size={18} /></div>
                </div>
                <div className="stat-card-value">{formatNumber(summary.impressions)}</div>
              </div>
              <div className="stat-card info fade-in">
                <div className="stat-card-header">
                  <span className="stat-card-label">Lượt click</span>
                  <div className="stat-card-icon info"><MousePointerClick size={18} /></div>
                </div>
                <div className="stat-card-value">{formatNumber(summary.clicks)}</div>
                <div className="stat-card-change positive">
                  CTR: {formatPercent(summary.ctr)}
                </div>
              </div>
              <div className="stat-card warning fade-in">
                <div className="stat-card-header">
                  <span className="stat-card-label">Chi phí</span>
                  <div className="stat-card-icon warning"><DollarSign size={18} /></div>
                </div>
                <div className="stat-card-value">{formatCurrency(summary.cost)}</div>
                <div className="stat-card-change">
                  CPC: {formatCurrency(summary.cpc)}
                </div>
              </div>
              <div className="stat-card success fade-in">
                <div className="stat-card-header">
                  <span className="stat-card-label">Chuyển đổi</span>
                  <div className="stat-card-icon success"><Target size={18} /></div>
                </div>
                <div className="stat-card-value">{formatNumber(summary.conversions)}</div>
                <div className="stat-card-change positive">
                  CR: {formatPercent(summary.conversionRate)}
                </div>
              </div>
            </div>
          )}

          {/* Charts */}
          {activeTab === "campaigns" && chartData.length > 0 && (
            <div className="chart-grid fade-in">
              <div className="card">
                <div className="card-header">
                  <span className="card-title">
                    <BarChart3 size={16} />
                    Clicks theo chiến dịch
                  </span>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,52,82,0.5)" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "#8b95b0" }}
                        angle={-35}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 11, fill: "#8b95b0" }} />
                      <Tooltip
                        contentStyle={{
                          background: "#1a2035",
                          border: "1px solid #2a3452",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="clicks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <span className="card-title">
                    <DollarSign size={16} />
                    Phân bổ chi phí
                  </span>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#1a2035",
                          border: "1px solid #2a3452",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value) => typeof value === "number" ? formatCurrency(value) : "—"}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className="card fade-in">
            <div className="card-header">
              <span className="card-title">
                <FileText size={16} />
                Dữ liệu chi tiết
                <span className="card-badge">{filteredData.length} kết quả</span>
              </span>
              <div className="search-input-wrapper">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="table-container">
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner" />
                  <span className="loading-text">Đang tải dữ liệu từ Google Ads...</span>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><BarChart3 size={28} /></div>
                  <h3>Chưa có dữ liệu</h3>
                  <p>Không tìm thấy dữ liệu trong khoảng thời gian đã chọn. Thử thay đổi khoảng ngày hoặc kiểm tra tài khoản Google Ads.</p>
                </div>
              ) : (
                <DataTable type={activeTab} data={filteredData} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ============= DATA TABLE COMPONENT ============= */
function DataTable({ type, data }: { type: TabType; data: Record<string, unknown>[] }) {
  switch (type) {
    case "campaigns":
      return <CampaignTable data={data} />;
    case "keywords":
      return <KeywordTable data={data} />;
    case "search-terms":
      return <SearchTermTable data={data} />;
    case "conversions":
      return <ConversionTable data={data} />;
    case "ad-groups":
      return <AdGroupTable data={data} />;
    default:
      return null;
  }
}

function CampaignTable({ data }: { data: Record<string, unknown>[] }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Chiến dịch</th>
          <th>Trạng thái</th>
          <th>Hiển thị</th>
          <th>Clicks</th>
          <th>CTR</th>
          <th>CPC TB</th>
          <th>Chi phí</th>
          <th>Chuyển đổi</th>
          <th>Tỷ lệ CD</th>
          <th>Ngày</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            <td className="table-cell-name" title={String(row.name)}>{String(row.name)}</td>
            <td><StatusBadge status={String(row.status)} /></td>
            <td className="table-cell-number">{formatNumber(Number(row.impressions))}</td>
            <td className="table-cell-number">{formatNumber(Number(row.clicks))}</td>
            <td className="table-cell-percent">{formatPercent(Number(row.ctr))}</td>
            <td className="table-cell-currency">{formatCurrency(Number(row.cpc))}</td>
            <td className="table-cell-currency">{formatCurrency(Number(row.cost))}</td>
            <td className="table-cell-number">{Number(row.conversions).toFixed(1)}</td>
            <td className="table-cell-percent">{formatPercent(Number(row.conversionRate))}</td>
            <td style={{ color: "var(--color-text-secondary)" }}>{String(row.date)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function KeywordTable({ data }: { data: Record<string, unknown>[] }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Từ khoá</th>
          <th>Match Type</th>
          <th>Chiến dịch</th>
          <th>Nhóm QC</th>
          <th>Hiển thị</th>
          <th>Clicks</th>
          <th>CTR</th>
          <th>CPC</th>
          <th>Chi phí</th>
          <th>Chuyển đổi</th>
          <th>QS</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            <td className="table-cell-name">{String(row.keyword)}</td>
            <td><MatchTypeBadge type={String(row.matchType)} /></td>
            <td style={{ color: "var(--color-text-secondary)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
              {String(row.campaignName)}
            </td>
            <td style={{ color: "var(--color-text-secondary)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" }}>
              {String(row.adGroupName)}
            </td>
            <td className="table-cell-number">{formatNumber(Number(row.impressions))}</td>
            <td className="table-cell-number">{formatNumber(Number(row.clicks))}</td>
            <td className="table-cell-percent">{formatPercent(Number(row.ctr))}</td>
            <td className="table-cell-currency">{formatCurrency(Number(row.cpc))}</td>
            <td className="table-cell-currency">{formatCurrency(Number(row.cost))}</td>
            <td className="table-cell-number">{Number(row.conversions).toFixed(1)}</td>
            <td><QualityScore score={row.qualityScore != null ? Number(row.qualityScore) : null} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SearchTermTable({ data }: { data: Record<string, unknown>[] }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Cụm từ tìm kiếm</th>
          <th>Từ khoá khớp</th>
          <th>Chiến dịch</th>
          <th>Nhóm QC</th>
          <th>Hiển thị</th>
          <th>Clicks</th>
          <th>CTR</th>
          <th>Chi phí</th>
          <th>Chuyển đổi</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            <td className="table-cell-name">{String(row.searchTerm)}</td>
            <td style={{ color: "var(--color-accent-light)" }}>{String(row.keyword)}</td>
            <td style={{ color: "var(--color-text-secondary)" }}>{String(row.campaignName)}</td>
            <td style={{ color: "var(--color-text-secondary)" }}>{String(row.adGroupName)}</td>
            <td className="table-cell-number">{formatNumber(Number(row.impressions))}</td>
            <td className="table-cell-number">{formatNumber(Number(row.clicks))}</td>
            <td className="table-cell-percent">{formatPercent(Number(row.ctr))}</td>
            <td className="table-cell-currency">{formatCurrency(Number(row.cost))}</td>
            <td className="table-cell-number">{Number(row.conversions).toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ConversionTable({ data }: { data: Record<string, unknown>[] }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Chiến dịch</th>
          <th>Nhóm QC</th>
          <th>Hành động CD</th>
          <th>Loại</th>
          <th>Ngày</th>
          <th>Giá trị</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            <td className="table-cell-name">{String(row.campaignName)}</td>
            <td style={{ color: "var(--color-text-secondary)" }}>{String(row.adGroupName)}</td>
            <td style={{ color: "var(--color-accent-light)" }}>{String(row.conversionAction)}</td>
            <td>{String(row.leadType)}</td>
            <td style={{ color: "var(--color-text-secondary)" }}>{String(row.submissionDate)}</td>
            <td className="table-cell-currency">{formatCurrency(Number(row.conversionValue))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AdGroupTable({ data }: { data: Record<string, unknown>[] }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Nhóm quảng cáo</th>
          <th>Chiến dịch</th>
          <th>Trạng thái</th>
          <th>Hiển thị</th>
          <th>Clicks</th>
          <th>CTR</th>
          <th>CPC</th>
          <th>Chi phí</th>
          <th>Chuyển đổi</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            <td className="table-cell-name">{String(row.name)}</td>
            <td style={{ color: "var(--color-text-secondary)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>
              {String(row.campaignName)}
            </td>
            <td><StatusBadge status={String(row.status)} /></td>
            <td className="table-cell-number">{formatNumber(Number(row.impressions))}</td>
            <td className="table-cell-number">{formatNumber(Number(row.clicks))}</td>
            <td className="table-cell-percent">{formatPercent(Number(row.ctr))}</td>
            <td className="table-cell-currency">{formatCurrency(Number(row.cpc))}</td>
            <td className="table-cell-currency">{formatCurrency(Number(row.cost))}</td>
            <td className="table-cell-number">{Number(row.conversions).toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ============= SMALL COMPONENTS ============= */
function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const cls = s === "ENABLED" ? "enabled" : s === "PAUSED" ? "paused" : "removed";
  const label = s === "ENABLED" ? "Đang chạy" : s === "PAUSED" ? "Tạm dừng" : s === "REMOVED" ? "Đã xoá" : status;
  return (
    <span className={`status-badge ${cls}`}>
      <span className="status-dot" />
      {label}
    </span>
  );
}

function MatchTypeBadge({ type }: { type: string }) {
  const t = type.toUpperCase();
  const cls = t.includes("EXACT") ? "exact" : t.includes("PHRASE") ? "phrase" : "broad";
  const label = t.includes("EXACT") ? "Exact" : t.includes("PHRASE") ? "Phrase" : "Broad";
  return <span className={`match-type-badge ${cls}`}>{label}</span>;
}

function QualityScore({ score }: { score: number | null }) {
  if (score === null) return <span style={{ color: "var(--color-text-muted)" }}>—</span>;
  const cls = score >= 7 ? "high" : score >= 4 ? "medium" : "low";
  return <span className={`quality-score ${cls}`}>{score}</span>;
}

/* ============= SETUP GUIDE ============= */
function SetupGuide() {
  return <AdsConnection />;
}
