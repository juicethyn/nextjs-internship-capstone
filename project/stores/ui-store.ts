import { create } from "zustand";

type UIStore = {
	isProjectDetailsOpen: boolean;
	isCreateListOpen: boolean;

	openProjectDetails: () => void;
	closeProjectDetails: () => void;
	setProjectDetailsOpen: (open: boolean) => void;

	openCreateList: () => void;
	closeCreateList: () => void;
	setCreateListOpen: (open: boolean) => void;
};

export const useUIStore = create<UIStore>((set) => ({
	isProjectDetailsOpen: false,
	isCreateListOpen: false,

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

	openCreateList: () =>
		set({
			isCreateListOpen: true,
		}),

	closeCreateList: () =>
		set({
			isCreateListOpen: false,
		}),

	setCreateListOpen: (open) =>
		set({
			isCreateListOpen: open,
		}),
}));
