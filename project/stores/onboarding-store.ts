import { create } from "zustand";
import type { Occupation } from "@/lib/db/schema";
import type { OnboardingInvite, OnboardingWorkspace } from "@/types/onboarding";

type OnboardingStore = {
	// State
	workspace: OnboardingWorkspace | null;
	invites: OnboardingInvite[];
	occupation: Occupation | null;

	// Actions
	setWorkspace: (workspace: OnboardingWorkspace) => void;
	addInvite: (invite: OnboardingInvite) => void;
	removeInvite: (email: string) => void;
	setOccupation: (occupation: Occupation | null) => void;
	reset: () => void;
};

const initialState = {
	workspace: null,
	invites: [],
	occupation: null,
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
	workspace: null as OnboardingWorkspace | null,

	invites: [],

	occupation: null as Occupation | null,

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

	setOccupation: (occupation) =>
		set({
			occupation,
		}),

	reset: () => set(initialState),
}));
