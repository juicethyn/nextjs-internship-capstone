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
