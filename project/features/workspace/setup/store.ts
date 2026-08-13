import { create } from "zustand";
import type {
	SetupInvite,
	SetupWorkspace,
} from "@/features/workspace/setup/types";

type WorkspaceSetupStore = {
	// State
	workspace: SetupWorkspace | null;
	invites: SetupInvite[];

	// Actions
	setWorkspace: (workspace: SetupWorkspace) => void;
	addInvite: (invite: SetupInvite) => void;
	removeInvite: (email: string) => void;
	reset: () => void;
};

export const useWorkspaceSetupStore = create<WorkspaceSetupStore>((set) => ({
	workspace: null,

	invites: [],

	setWorkspace: (workspace) =>
		set({
			workspace,
		}),

	addInvite: (invite) =>
		set((state) => ({
			invites: [...state.invites, invite],
		})),

	removeInvite: (email) =>
		set((state) => ({
			invites: state.invites.filter((invite) => invite.email !== email),
		})),

	reset: () =>
		set({
			workspace: null,
			invites: [],
		}),
}));
