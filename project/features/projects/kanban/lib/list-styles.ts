import type { ListType } from "@/lib/db/types";

export const LIST_TYPE_STYLES = {
	todo: {
		accent: "bg-muted-foreground",
		border: "border-l-muted-foreground",
		title: "text-foreground",
	},
	in_progress: {
		accent: "bg-amber-500",
		border: "border-l-amber-500",
		title: "text-amber-700 dark:text-amber-400",
	},
	done: {
		accent: "bg-emerald-500",
		border: "border-l-emerald-500",
		title: "text-emerald-700 dark:text-emerald-400",
	},
} as const satisfies Record<
	ListType,
	{ accent: string; border: string; title: string }
>;

export function getListTypeStyle(type: ListType) {
	return LIST_TYPE_STYLES[type];
}
