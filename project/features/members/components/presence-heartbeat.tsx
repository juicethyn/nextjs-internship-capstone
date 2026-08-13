"use client";

import { useQuery } from "@tanstack/react-query";
import { heartbeatWorkspacePresenceAction } from "@/features/members/actions/workspaceMembers";
import { PRESENCE_HEARTBEAT_MS } from "@/features/members/lib/presence";

type PresenceHeartbeatProps = {
	workspaceSlug: string;
};

export function PresenceHeartbeat({ workspaceSlug }: PresenceHeartbeatProps) {
	useQuery({
		queryKey: ["presence-heartbeat", workspaceSlug],
		queryFn: () => heartbeatWorkspacePresenceAction(workspaceSlug),
		refetchInterval: PRESENCE_HEARTBEAT_MS,
		staleTime: 0,
		gcTime: 0,
		retry: false,
	});

	return null;
}
