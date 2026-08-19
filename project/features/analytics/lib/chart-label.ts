const ELLIPSIS = "…";

export function getLabelMaxChars(count: number) {
	if (count <= 3) return 18;

	if (count <= 5) return 14;

	return 10;
}

export function truncateLabel(label: string, maxChars: number) {
	if (label.length <= maxChars) return label;

	return `${label.slice(0, Math.max(1, maxChars - 1)).trimEnd()}${ELLIPSIS}`;
}
