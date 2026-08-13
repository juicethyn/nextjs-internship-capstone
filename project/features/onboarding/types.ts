import type {
	SetupInvite,
	SetupWorkspace,
} from "@/features/workspace/setup/types";
import type { Occupation } from "@/lib/db/schema";

export interface OnboardingPayload {
	workspace: SetupWorkspace;
	invites: SetupInvite[];
	occupation: Occupation;
}
