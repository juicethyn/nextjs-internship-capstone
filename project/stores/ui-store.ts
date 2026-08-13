import { create } from "zustand";
import { DEFAULT_TASK_SORT, type TaskSortKey } from "@/lib/utils/task-sort";

export type ProjectSettingsTab = "general" | "members" | "labels" | "danger";

type UIStore = {
	isProjectDetailsOpen: boolean;
	isCreateListOpen: boolean;
	isProjectInviteOpen: boolean;
	isProjectSettingsOpen: boolean;
	projectSettingsTab: ProjectSettingsTab;

	// Shared rather than local so the dialog can be rendered once per route and
	// opened from anywhere — the members header today, the dashboard next.
	isWorkspaceInviteOpen: boolean;
	openWorkspaceInvite: () => void;
	closeWorkspaceInvite: () => void;
	setWorkspaceInviteOpen: (open: boolean) => void;

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

	isCommentsOpen: boolean;
	toggleComments: () => void;

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

	isWorkspaceInviteOpen: false,

	openWorkspaceInvite: () =>
		set({
			isWorkspaceInviteOpen: true,
		}),

	closeWorkspaceInvite: () =>
		set({
			isWorkspaceInviteOpen: false,
		}),

	setWorkspaceInviteOpen: (open) =>
		set({
			isWorkspaceInviteOpen: open,
		}),

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

	// Back to the default on close, so the next card opens with comments shown.
	closeTaskDetails: () =>
		set({
			openTaskId: null,
			isCommentsOpen: true,
		}),

	isCommentsOpen: true,

	toggleComments: () =>
		set((state) => ({
			isCommentsOpen: !state.isCommentsOpen,
		})),

	taskSort: DEFAULT_TASK_SORT,

	setTaskSort: (sort) =>
		set({
			taskSort: sort,
		}),
}));
