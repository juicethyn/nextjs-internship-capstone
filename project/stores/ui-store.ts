import { create } from "zustand";

type UIStore = {
	isProjectDetailsOpen: boolean;

	openProjectDetails: () => void;
	closeProjectDetails: () => void;
	setProjectDetailsOpen: (open: boolean) => void;
};

export const useUIStore = create<UIStore>((set) => ({
	isProjectDetailsOpen: false,

	openProjectDetails: () =>
		set({
			isProjectDetailsOpen: true,
		}),

	closeProjectDetails: () =>
		set({
			isProjectDetailsOpen: false,
		}),

	setProjectDetailsOpen: (open) =>
		set({
			isProjectDetailsOpen: open,
		}),
}));
