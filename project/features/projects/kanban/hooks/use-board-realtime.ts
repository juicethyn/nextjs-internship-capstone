"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { Members, PresenceChannel } from "pusher-js";
import { useCallback, useEffect, useRef } from "react";
import { type BoardViewer, useProjectUIStore } from "@/features/projects/store";
import {
	BOARD_CHANGED_EVENT,
	type BoardChangedPayload,
	projectChannel,
} from "@/lib/pusher/channels";
import { getPusherClient } from "@/lib/pusher/client";

const REFRESH_DEBOUNCE_MS = 200;

type UseBoardRealtimeProps = {
	workspaceSlug: string;
	projectSlug: string;
	projectId: string;
	currentUserId: string;
};

type PresenceInfo = {
	firstName: string;
	lastName: string;
	imageUrl: string | null;
};

function toViewers(members: Members, currentUserId: string) {
	const viewers: BoardViewer[] = [];

	members.each((member: { id: string; info: PresenceInfo }) => {
		if (member.id === currentUserId) return;

		viewers.push({
			id: member.id,
			firstName: member.info.firstName,
			lastName: member.info.lastName,
			imageUrl: member.info.imageUrl,
		});
	});

	return viewers;
}

export function useBoardRealtime({
	workspaceSlug,
	projectSlug,
	projectId,
	currentUserId,
}: UseBoardRealtimeProps) {
	const queryClient = useQueryClient();

	const isBoardDragging = useProjectUIStore((state) => state.isBoardDragging);
	const setBoardViewers = useProjectUIStore((state) => state.setBoardViewers);

	const pendingRef = useRef(false);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const refresh = useCallback(() => {
		queryClient.invalidateQueries({
			queryKey: ["project", workspaceSlug, projectSlug],
		});

		queryClient.invalidateQueries({
			queryKey: ["comments", workspaceSlug, projectSlug],
		});
	}, [queryClient, workspaceSlug, projectSlug]);

	useEffect(() => {
		const channelName = projectChannel(projectId);
		const channel = getPusherClient().subscribe(channelName) as PresenceChannel;

		const syncViewers = () => {
			setBoardViewers(toViewers(channel.members, currentUserId));
		};

		const handleChanged = (payload: BoardChangedPayload) => {
			if (payload.actorId === currentUserId) return;

			if (useProjectUIStore.getState().isBoardDragging) {
				pendingRef.current = true;
				return;
			}

			if (debounceRef.current) clearTimeout(debounceRef.current);

			debounceRef.current = setTimeout(() => {
				refresh();
			}, REFRESH_DEBOUNCE_MS);
		};

		channel.bind(BOARD_CHANGED_EVENT, handleChanged);
		channel.bind("pusher:subscription_succeeded", syncViewers);
		channel.bind("pusher:member_added", syncViewers);
		channel.bind("pusher:member_removed", syncViewers);

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);

			channel.unbind(BOARD_CHANGED_EVENT, handleChanged);
			channel.unbind("pusher:subscription_succeeded", syncViewers);
			channel.unbind("pusher:member_added", syncViewers);
			channel.unbind("pusher:member_removed", syncViewers);

			getPusherClient().unsubscribe(channelName);
			setBoardViewers([]);
		};
	}, [projectId, currentUserId, setBoardViewers, refresh]);

	useEffect(() => {
		if (isBoardDragging || !pendingRef.current) return;

		pendingRef.current = false;
		refresh();
	}, [isBoardDragging, refresh]);
}
