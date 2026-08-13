export const PRESENCE_HEARTBEAT_MS = 60_000;

// Three missed beats. Presence is reported rather than observed — a crashed
// browser never says goodbye — so silence for this long is what counts as gone.
export const PRESENCE_TIMEOUT_MS = 3 * 60_000;

export function isPresent(lastSeenAt: Date | string | null | undefined) {
	if (!lastSeenAt) return false;

	const seenAt = lastSeenAt instanceof Date ? lastSeenAt : new Date(lastSeenAt);

	if (Number.isNaN(seenAt.getTime())) return false;

	return Date.now() - seenAt.getTime() < PRESENCE_TIMEOUT_MS;
}
