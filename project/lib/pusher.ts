import PusherServer from "pusher";
import Pusher from "pusher-js";

// To fix Biome's forbidden non-null assertions
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
});

export const pusherClient = new Pusher(
	getEnv("NEXT_PUBLIC_PUSHER_PUBLISHER_KEY"),
	{
		cluster: getEnv("NEXT_PUBLIC_PUSHER_CLUSTER"),
	},
);
