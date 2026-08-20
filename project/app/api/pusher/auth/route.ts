import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canAccessProject } from "@/lib/permission";
import { projectIdFromChannel, userChannel } from "@/lib/pusher/channels";
import { pusherServer } from "@/lib/pusher/server";

export async function POST(req: NextRequest) {
	try {
		const user = await getCurrentUser();

		const form = await req.formData();
		const socketId = form.get("socket_id");
		const channelName = form.get("channel_name");

		if (typeof socketId !== "string" || typeof channelName !== "string") {
			return new Response("Malformed authorization request", { status: 400 });
		}

		if (channelName === userChannel(user.id)) {
			return Response.json(
				pusherServer.authorizeChannel(socketId, channelName),
			);
		}

		const projectId = projectIdFromChannel(channelName);

		if (!projectId || !(await canAccessProject(projectId, user.id))) {
			return new Response("Forbidden", { status: 403 });
		}

		return Response.json(
			pusherServer.authorizeChannel(socketId, channelName, {
				user_id: user.id,
				user_info: {
					firstName: user.firstName,
					lastName: user.lastName,
					imageUrl: user.imageUrl,
				},
			}),
		);
	} catch (err) {
		console.error("Error authorizing Pusher channel:", err);
		return new Response("Unauthorized", { status: 401 });
	}
}
