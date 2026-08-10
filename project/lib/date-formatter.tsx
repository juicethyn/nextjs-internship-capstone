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
