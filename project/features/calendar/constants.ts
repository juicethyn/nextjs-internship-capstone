import type { EventType } from "@/lib/db/types";

export const CALENDAR_SURFACE = "h-[70svh] lg:h-auto lg:min-h-130 lg:flex-1";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
	meeting: "Meeting",
	planning: "Planning",
	review: "Review",
	presentation: "Presentation",
	discussion: "Discussion",
	other: "Other",
};
