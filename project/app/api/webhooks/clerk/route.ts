import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { deleteUserByClerkId, upsertUser } from "@/lib/db/queries/users";

export async function POST(req: NextRequest) {
	try {
		const evt = await verifyWebhook(req);

		switch (evt.type) {
			case "user.created":
			case "user.updated":
				await upsertUser({
					clerkId: evt.data.id,
					email: evt.data.email_addresses[0].email_address,
					firstName: evt.data.first_name ?? "",
					lastName: evt.data.last_name ?? "",
					imageUrl: evt.data.image_url ?? "",
					occupation: "other",
				});

				break;
			case "user.deleted":
				await deleteUserByClerkId(evt.data.id ?? "");

				break;
			default:
				console.log(`Unhandled event type: ${evt.type}`);
		}

		return new Response("Webhook received", { status: 200 });
	} catch (err) {
		console.error("Error verifying webhook:", err);

		return new Response("Error verifying webhook", { status: 400 });
	}
}
