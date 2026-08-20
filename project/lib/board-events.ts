import {
	BOARD_CHANGED_EVENT,
	type BoardEventKind,
	projectChannel,
} from "./pusher/channels";
import { pusherServer } from "./pusher/server";

export async function publishBoardEvent(
	projectId: string,
	actorId: string,
	kind: BoardEventKind,
) {
	try {
		await pusherServer.trigger(projectChannel(projectId), BOARD_CHANGED_EVENT, {
			actorId,
			kind,
		});
	} catch (error) {
		console.warn("Failed to publish board event:", error);
	}
}
