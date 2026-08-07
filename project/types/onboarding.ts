import type { Occupation } from "@/lib/db/schema";
import type { SetupInvite, SetupWorkspace } from "./workspace-setup";

export interface OnboardingPayload {
	workspace: SetupWorkspace;
	invites: SetupInvite[];
	occupation: Occupation;
}
