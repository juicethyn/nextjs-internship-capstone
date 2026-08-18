import { create } from "zustand";

type AnalyticsUIStore = {
	// The project filter lives in the page header while the charts render in
	// sibling sections, so this has to be shared rather than local state.
	projectId: string | null;

	setProjectId: (projectId: string | null) => void;
};

export const useAnalyticsUIStore = create<AnalyticsUIStore>((set) => ({
	projectId: null,

	setProjectId: (projectId) =>
		set({
			projectId,
		}),
}));
