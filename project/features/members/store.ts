import { create } from "zustand";

type MemberUIStore = {
	// Shared rather than local so the dialog can be rendered once per route and
	// opened from anywhere — the members header today, the dashboard next.
	isWorkspaceInviteOpen: boolean;
	openWorkspaceInvite: () => void;
	closeWorkspaceInvite: () => void;
	setWorkspaceInviteOpen: (open: boolean) => void;
};

export const useMemberUIStore = create<MemberUIStore>((set) => ({
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
}));
