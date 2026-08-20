import { create } from "zustand";
import {
	DEFAULT_TASK_SORT,
	type TaskSortKey,
} from "@/features/projects/kanban/lib/task-sort";

export type ProjectSettingsTab = "general" | "members" | "labels" | "danger";

export type BoardViewer = {
	id: string;
	firstName: string;
	lastName: string;
	imageUrl: string | null;
};

type ProjectUIStore = {
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

	isCommentsOpen: boolean;
	toggleComments: () => void;

	// View-only card ordering. The Sort button lives in ProjectPageHeader while the
	// cards render in ListCard — sibling trees, so this has to be shared state.
	taskSort: TaskSortKey;
	setTaskSort: (sort: TaskSortKey) => void;

	// The board renders straight from the query cache, so a realtime refetch
	// landing mid-drag would yank the card out from under the cursor.
	isBoardDragging: boolean;
	setBoardDragging: (dragging: boolean) => void;

	// Presence lands in KanbanBoard but renders in ProjectPageHeader.
	boardViewers: BoardViewer[];
	setBoardViewers: (viewers: BoardViewer[]) => void;
};

export const useProjectUIStore = create<ProjectUIStore>((set) => ({
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

	isBoardDragging: false,

	setBoardDragging: (dragging) =>
		set({
			isBoardDragging: dragging,
		}),

	boardViewers: [],

	setBoardViewers: (viewers) =>
		set({
			boardViewers: viewers,
		}),
}));
