"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getWorkspacePresenceAction } from "@/features/members/actions/workspaceMembers";
import { PRESENCE_HEARTBEAT_MS } from "@/features/members/lib/presence";

export function useWorkspacePresence(workspaceSlug: string, enabled = true) {
	const query = useQuery({
		queryKey: ["workspace-presence", workspaceSlug],
		queryFn: async () => {
			const result = await getWorkspacePresenceAction(workspaceSlug);

			if (!result.success) throw new Error(result.message);

			return result.data;
		},
		refetchInterval: PRESENCE_HEARTBEAT_MS,
		enabled,
	});

	const lastSeenByUserId = useMemo(
		() =>
			new Map((query.data ?? []).map((row) => [row.userId, row.lastSeenAt])),
		[query.data],
	);

	return { lastSeenByUserId };
}
