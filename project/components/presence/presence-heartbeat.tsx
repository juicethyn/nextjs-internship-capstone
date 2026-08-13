"use client";

import { useQuery } from "@tanstack/react-query";
import { heartbeatWorkspacePresenceAction } from "@/lib/actions/workspaceMembers";
import { PRESENCE_HEARTBEAT_MS } from "@/lib/utils/presence";

type PresenceHeartbeatProps = {
	workspaceSlug: string;
};

// This component is mounted in the workspace layout and runs a heartbeat query
// on an interval to keep the viewer's presence up to date. It doesn't render
// anything.
export function PresenceHeartbeat({ workspaceSlug }: PresenceHeartbeatProps) {
	useQuery({
		queryKey: ["presence-heartbeat", workspaceSlug],
		queryFn: () => heartbeatWorkspacePresenceAction(workspaceSlug),
		// Runs on mount too, so you show up online immediately rather than after
		// the first interval elapses.
		refetchInterval: PRESENCE_HEARTBEAT_MS,
		// refetchIntervalInBackground defaults to false: beats stop when the tab
		// loses focus, which is what makes "online" mean in the app rather than
		// has a tab pinned.
		staleTime: 0,
		gcTime: 0,
		retry: false,
	});

	return null;
}
