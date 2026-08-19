import { useMemo } from "react";
import { create } from "zustand";
import { DEFAULT_ANALYTICS_PERIOD } from "@/features/analytics/constants";
import type {
	AnalyticsFilters,
	AnalyticsPeriod,
} from "@/features/analytics/types";

type AnalyticsUIStore = {
	// The filters live in the page header while the charts render in sibling
	// sections, so these have to be shared rather than local state.
	projectId: string | null;
	period: AnalyticsPeriod;
	includeArchived: boolean;

	setProjectId: (projectId: string | null) => void;
	setPeriod: (period: AnalyticsPeriod) => void;
	setIncludeArchived: (includeArchived: boolean) => void;
};

export const useAnalyticsUIStore = create<AnalyticsUIStore>((set) => ({
	projectId: null,
	period: DEFAULT_ANALYTICS_PERIOD,
	includeArchived: false,

	setProjectId: (projectId) =>
		set({
			projectId,
		}),

	setPeriod: (period) =>
		set({
			period,
		}),

	setIncludeArchived: (includeArchived) =>
		set({
			includeArchived,
		}),
}));

// Selected field by field rather than as one object literal: a selector
// returning a fresh object every render trips Zustand's snapshot check.
export function useAnalyticsFilters(): AnalyticsFilters {
	const projectId = useAnalyticsUIStore((state) => state.projectId);
	const period = useAnalyticsUIStore((state) => state.period);
	const includeArchived = useAnalyticsUIStore((state) => state.includeArchived);

	return useMemo(
		() => ({ projectId, period, includeArchived }),
		[projectId, period, includeArchived],
	);
}
