export function formatProjectDate(
	date: Date | string | null | undefined,
	fallback = "",
) {
	if (!date) return fallback;

	const parsedDate = date instanceof Date ? date : new Date(date);

	if (Number.isNaN(parsedDate.getTime())) return fallback;

	return parsedDate.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	});
}

// Local time, unlike formatProjectDate above. This renders "today" for the
// person reading the screen, so pinning it to UTC would show them the wrong
// weekday for several hours a day.
export function formatFullDate(date: Date) {
	return date.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

export function combineDateAndTime(date: Date, time: string) {
	const [hours, minutes] = time.split(":").map(Number);

	return new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		Number.isFinite(hours) ? hours : 0,
		Number.isFinite(minutes) ? minutes : 0,
	);
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

// Deliberately LOCAL time, unlike formatProjectDate above. Due dates are
// date-only values that render as UTC to dodge an off-by-one; a comment is a
// real instant, so pinning it to UTC would show someone at UTC+8 7:33am for a
// comment they posted at 3:33pm. Do not "fix" this to match the others.
export function formatCommentTimestamp(date: Date | string) {
	const parsedDate = date instanceof Date ? date : new Date(date);

	if (Number.isNaN(parsedDate.getTime())) return "";

	const elapsed = Date.now() - parsedDate.getTime();

	// Clock skew or an optimistic row stamped a hair in the future.
	if (elapsed < SECOND) return "1s ago";

	if (elapsed < MINUTE) return `${Math.floor(elapsed / SECOND)}s ago`;

	if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}min ago`;

	if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}hr ago`;

	if (elapsed < WEEK) {
		const days = Math.floor(elapsed / DAY);

		return `${days} ${days === 1 ? "day" : "days"} ago`;
	}

	const day = parsedDate.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	const time = parsedDate
		.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		})
		.replace(/\s/g, "")
		.toLowerCase();

	return `${day} at ${time}`;
}

// Compared on the same UTC calendar-day basis formatProjectDate renders with,
// so the styling can never contradict the date printed on screen. Whole days,
// not instants — a task due today is not yet overdue.
export function isOverdue(date: Date | string | null | undefined) {
	if (!date) return false;

	const parsedDate = date instanceof Date ? date : new Date(date);

	if (Number.isNaN(parsedDate.getTime())) return false;

	const now = new Date();

	const todayUTC = Date.UTC(
		now.getUTCFullYear(),
		now.getUTCMonth(),
		now.getUTCDate(),
	);

	const dueUTC = Date.UTC(
		parsedDate.getUTCFullYear(),
		parsedDate.getUTCMonth(),
		parsedDate.getUTCDate(),
	);

	return dueUTC < todayUTC;
}
