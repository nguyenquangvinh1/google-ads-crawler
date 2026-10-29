import { GoogleAdsApi } from "google-ads-api";
import { AdsAuthError, readSession } from "./ads-session";

let client: GoogleAdsApi | null = null;

export function getClient(): GoogleAdsApi {
  if (!client) {
    client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    });
  }
  return client;
}

async function getCustomer() {
  const session = await readSession();
  if (!session.customerId) throw new AdsAuthError("Vui lòng chọn tài khoản Google Ads");
  const api = getClient();
  return api.Customer({
    customer_id: session.customerId,
    refresh_token: session.refreshToken,
  });
}

export interface CampaignData {
  id: string;
  name: string;
  status: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
  date: string;
}

export interface KeywordData {
  id: string;
  keyword: string;
  matchType: string;
  campaignName: string;
  adGroupName: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
  cpc: number;
  qualityScore: number | null;
}

export interface SearchTermData {
  searchTerm: string;
  keyword: string;
  campaignName: string;
  adGroupName: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
}

export interface LeadData {
  id: string;
  campaignName: string;
  adGroupName: string;
  formName: string;
  submissionDate: string;
  leadType: string;
  conversionAction: string;
  conversionValue: number;
}

export interface AdGroupData {
  id: string;
  name: string;
  campaignName: string;
  status: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
  cpc: number;
}

// Fetch campaign performance data
export async function getCampaignPerformance(
  startDate: string,
  endDate: string
): Promise<CampaignData[]> {
  const customer = await getCustomer();

  const campaigns = await customer.query(`
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.ctr,
      metrics.average_cpc,
      metrics.conversions_from_interactions_rate,
      segments.date
    FROM campaign
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status != 'REMOVED'
    ORDER BY metrics.impressions DESC
  `);

  return campaigns.map((row: Record<string, unknown>) => {
    const campaign = row.campaign as Record<string, unknown>;
    const metrics = row.metrics as Record<string, unknown>;
    const segments = row.segments as Record<string, unknown>;
    return {
      id: String(campaign.id ?? ""),
      name: String(campaign.name ?? ""),
      status: String(campaign.status ?? ""),
      impressions: Number(metrics.impressions ?? 0),
      clicks: Number(metrics.clicks ?? 0),
      cost: Number(metrics.cost_micros ?? 0) / 1_000_000,
      conversions: Number(metrics.conversions ?? 0),
      ctr: Number(metrics.ctr ?? 0),
      cpc: Number(metrics.average_cpc ?? 0) / 1_000_000,
      conversionRate: Number(metrics.conversions_from_interactions_rate ?? 0),
      date: String(segments.date ?? ""),
    };
  });
}

// Fetch keyword performance
export async function getKeywordPerformance(
  startDate: string,
  endDate: string
): Promise<KeywordData[]> {
  const customer = await getCustomer();

  const keywords = await customer.query(`
    SELECT
      ad_group_criterion.criterion_id,
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      campaign.name,
      ad_group.name,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.ctr,
      metrics.average_cpc,
      ad_group_criterion.quality_info.quality_score
    FROM keyword_view
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status != 'REMOVED'
      AND ad_group.status != 'REMOVED'
    ORDER BY metrics.impressions DESC
    LIMIT 500
  `);

  return keywords.map((row: Record<string, unknown>) => {
    const criterion = row.ad_group_criterion as Record<string, unknown>;
    const keyword = criterion.keyword as Record<string, unknown>;
    const qualityInfo = criterion.quality_info as Record<string, unknown> | undefined;
    const campaign = row.campaign as Record<string, unknown>;
    const adGroup = row.ad_group as Record<string, unknown>;
    const metrics = row.metrics as Record<string, unknown>;
    return {
      id: String(criterion.criterion_id ?? ""),
      keyword: String(keyword?.text ?? ""),
      matchType: String(keyword?.match_type ?? ""),
      campaignName: String(campaign.name ?? ""),
      adGroupName: String(adGroup.name ?? ""),
      impressions: Number(metrics.impressions ?? 0),
      clicks: Number(metrics.clicks ?? 0),
      cost: Number(metrics.cost_micros ?? 0) / 1_000_000,
      conversions: Number(metrics.conversions ?? 0),
      ctr: Number(metrics.ctr ?? 0),
      cpc: Number(metrics.average_cpc ?? 0) / 1_000_000,
      qualityScore: qualityInfo?.quality_score != null
        ? Number(qualityInfo.quality_score)
        : null,
    };
  });
}

// Fetch search terms report
export async function getSearchTermsReport(
  startDate: string,
  endDate: string
): Promise<SearchTermData[]> {
  const customer = await getCustomer();

  const searchTerms = await customer.query(`
    SELECT
      search_term_view.search_term,
      ad_group_criterion.keyword.text,
      campaign.name,
      ad_group.name,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.ctr
    FROM search_term_view
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status != 'REMOVED'
    ORDER BY metrics.impressions DESC
    LIMIT 500
  `);

  return searchTerms.map((row: Record<string, unknown>) => {
    const stv = row.search_term_view as Record<string, unknown>;
    const criterion = row.ad_group_criterion as Record<string, unknown>;
    const keyword = criterion?.keyword as Record<string, unknown>;
    const campaign = row.campaign as Record<string, unknown>;
    const adGroup = row.ad_group as Record<string, unknown>;
    const metrics = row.metrics as Record<string, unknown>;
    return {
      searchTerm: String(stv?.search_term ?? ""),
      keyword: String(keyword?.text ?? ""),
      campaignName: String(campaign.name ?? ""),
      adGroupName: String(adGroup.name ?? ""),
      impressions: Number(metrics.impressions ?? 0),
      clicks: Number(metrics.clicks ?? 0),
      cost: Number(metrics.cost_micros ?? 0) / 1_000_000,
      conversions: Number(metrics.conversions ?? 0),
      ctr: Number(metrics.ctr ?? 0),
    };
  });
}

// Fetch conversion/lead data
export async function getConversions(
  startDate: string,
  endDate: string
): Promise<LeadData[]> {
  const customer = await getCustomer();

  const conversions = await customer.query(`
    SELECT
      campaign.name,
      ad_group.name,
      conversion_action.name,
      conversion_action.type,
      metrics.conversions,
      metrics.conversions_value,
      segments.date,
      segments.conversion_action_name
    FROM campaign
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status != 'REMOVED'
      AND metrics.conversions > 0
    ORDER BY segments.date DESC
  `);

  return conversions.map((row: Record<string, unknown>, index: number) => {
    const campaign = row.campaign as Record<string, unknown>;
    const adGroup = row.ad_group as Record<string, unknown>;
    const convAction = row.conversion_action as Record<string, unknown>;
    const metrics = row.metrics as Record<string, unknown>;
    const segments = row.segments as Record<string, unknown>;
    return {
      id: String(index + 1),
      campaignName: String(campaign.name ?? ""),
      adGroupName: String(adGroup?.name ?? ""),
      formName: String(convAction?.name ?? ""),
      submissionDate: String(segments.date ?? ""),
      leadType: String(convAction?.type ?? ""),
      conversionAction: String(segments.conversion_action_name ?? ""),
      conversionValue: Number(metrics.conversions_value ?? 0),
    };
  });
}

// Fetch ad group performance
export async function getAdGroupPerformance(
  startDate: string,
  endDate: string
): Promise<AdGroupData[]> {
  const customer = await getCustomer();

  const adGroups = await customer.query(`
    SELECT
      ad_group.id,
      ad_group.name,
      campaign.name,
      ad_group.status,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.ctr,
      metrics.average_cpc
    FROM ad_group
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status != 'REMOVED'
      AND ad_group.status != 'REMOVED'
    ORDER BY metrics.impressions DESC
    LIMIT 200
  `);

  return adGroups.map((row: Record<string, unknown>) => {
    const adGroup = row.ad_group as Record<string, unknown>;
    const campaign = row.campaign as Record<string, unknown>;
    const metrics = row.metrics as Record<string, unknown>;
    return {
      id: String(adGroup.id ?? ""),
      name: String(adGroup.name ?? ""),
      campaignName: String(campaign.name ?? ""),
      status: String(adGroup.status ?? ""),
      impressions: Number(metrics.impressions ?? 0),
      clicks: Number(metrics.clicks ?? 0),
      cost: Number(metrics.cost_micros ?? 0) / 1_000_000,
      conversions: Number(metrics.conversions ?? 0),
      ctr: Number(metrics.ctr ?? 0),
      cpc: Number(metrics.average_cpc ?? 0) / 1_000_000,
    };
  });
}

// Get account summary
export async function getAccountSummary(
  startDate: string,
  endDate: string
) {
  const customer = await getCustomer();

  const summary = await customer.query(`
    SELECT
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.ctr,
      metrics.average_cpc,
      metrics.conversions_from_interactions_rate
    FROM customer
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
  `);

  if (summary.length === 0) {
    return {
      impressions: 0,
      clicks: 0,
      cost: 0,
      conversions: 0,
      ctr: 0,
      cpc: 0,
      conversionRate: 0,
    };
  }

  const totals = summary.reduce(
    (acc: Record<string, number>, row: Record<string, unknown>) => {
      const metrics = row.metrics as Record<string, unknown>;
      return {
        impressions: acc.impressions + Number(metrics.impressions ?? 0),
        clicks: acc.clicks + Number(metrics.clicks ?? 0),
        cost: acc.cost + Number(metrics.cost_micros ?? 0) / 1_000_000,
        conversions: acc.conversions + Number(metrics.conversions ?? 0),
      };
    },
    { impressions: 0, clicks: 0, cost: 0, conversions: 0 }
  );

  return {
    ...totals,
    ctr: totals.clicks / (totals.impressions || 1),
    cpc: totals.cost / (totals.clicks || 1),
    conversionRate: totals.conversions / (totals.clicks || 1),
  };
}
