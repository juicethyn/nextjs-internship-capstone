import type { ANALYTICS_PERIODS } from "@/features/analytics/constants";

export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number]["value"];

export type AnalyticsFilters = {
	projectId: string | null;
	period: AnalyticsPeriod;
	includeArchived: boolean;
};
