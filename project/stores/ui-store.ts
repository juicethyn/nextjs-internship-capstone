import { create } from "zustand";
import { DEFAULT_TASK_SORT, type TaskSortKey } from "@/lib/utils/task-sort";

export type ProjectSettingsTab = "general" | "members" | "labels" | "danger";

type UIStore = {
	isProjectDetailsOpen: boolean;
	isCreateListOpen: boolean;
	isProjectInviteOpen: boolean;
	isProjectSettingsOpen: boolean;
	projectSettingsTab: ProjectSettingsTab;

	openProjectDetails: () => void;
	closeProjectDetails: () => void;
	setProjectDetailsOpen: (open: boolean) => void;

	openProjectInvite: () => void;
	closeProjectInvite: () => void;
	setProjectInviteOpen: (open: boolean) => void;

	openProjectSettings: (tab?: ProjectSettingsTab) => void;
	closeProjectSettings: () => void;
	setProjectSettingsOpen: (open: boolean) => void;
	setProjectSettingsTab: (tab: ProjectSettingsTab) => void;

	openCreateList: () => void;
	closeCreateList: () => void;
	setCreateListOpen: (open: boolean) => void;

	openTaskId: string | null;
	openTaskDetails: (taskId: string) => void;
	closeTaskDetails: () => void;

	// View-only card ordering. The Sort button lives in KanbanHeader while the
	// cards render in ListCard — sibling trees, so this has to be shared state.
	taskSort: TaskSortKey;
	setTaskSort: (sort: TaskSortKey) => void;
};

export const useUIStore = create<UIStore>((set) => ({
	isProjectDetailsOpen: false,
	isCreateListOpen: false,
	isProjectInviteOpen: false,
	isProjectSettingsOpen: false,
	projectSettingsTab: "general",

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

	openProjectInvite: () =>
		set({
			isProjectInviteOpen: true,
		}),

	closeProjectInvite: () =>
		set({
			isProjectInviteOpen: false,
		}),

	setProjectInviteOpen: (open) =>
		set({
			isProjectInviteOpen: open,
		}),

	openProjectSettings: (tab = "general") =>
		set({
			isProjectSettingsOpen: true,
			projectSettingsTab: tab,
		}),

	closeProjectSettings: () =>
		set({
			isProjectSettingsOpen: false,
		}),

	setProjectSettingsOpen: (open) =>
		set({
			isProjectSettingsOpen: open,
		}),

	setProjectSettingsTab: (tab) =>
		set({
			projectSettingsTab: tab,
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

	openTaskId: null,

	openTaskDetails: (taskId) =>
		set({
			openTaskId: taskId,
		}),

	closeTaskDetails: () =>
		set({
			openTaskId: null,
		}),

	taskSort: DEFAULT_TASK_SORT,

	setTaskSort: (sort) =>
		set({
			taskSort: sort,
		}),
}));
