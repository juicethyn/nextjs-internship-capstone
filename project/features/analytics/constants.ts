export const PROJECT_STATUS_COLORS = {
	done: "var(--chart-3)",
	in_progress: "var(--chart-1)",
	todo: "var(--muted-foreground)",
} as const;

export const PROJECT_PROGRESS_LIMIT = 8;

export const ANALYTICS_PERIODS = [
	{ value: "7d", label: "Last 7 days", days: 7 },
	{ value: "30d", label: "Last 30 days", days: 30 },
	{ value: "90d", label: "Last 90 days", days: 90 },
	{ value: "12m", label: "Last 12 months", days: 365 },
] as const;

export const DEFAULT_ANALYTICS_PERIOD = "30d";

// Only chart-1..5 are declared in both the light and dark blocks of globals.css,
// so the palette stops at five and everyone below it shares the muted tone.
export const RANK_COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
] as const;

export const UNRANKED_COLOR = "var(--muted-foreground)";
