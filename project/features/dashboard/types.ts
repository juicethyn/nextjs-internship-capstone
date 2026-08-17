import type { WorkspaceMemberRole } from "@/lib/db/types";

export type DashboardHeaderData = {
	workspaceName: string;
	viewerRole: WorkspaceMemberRole;
};
