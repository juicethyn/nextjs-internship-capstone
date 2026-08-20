import "server-only";

import PusherServer from "pusher";

function getEnv(key: string): string {
	const value = process.env[key];

	if (!value) {
		throw new Error(`Missing environment variable: ${key}`);
	}

	return value;
}

export const pusherServer = new PusherServer({
	appId: getEnv("NEXT_PUBLIC_PUSHER_APP_ID"),
	key: getEnv("NEXT_PUBLIC_PUSHER_PUBLISHER_KEY"),
	secret: getEnv("PUSHER_SECRET_KEY"),
	cluster: getEnv("NEXT_PUBLIC_PUSHER_CLUSTER"),
	useTLS: true,
});
