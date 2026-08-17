import { create } from "zustand";
import {
	addDays,
	startOfWeekLocal,
} from "@/features/calendar/lib/calendar-utils";
import type {
	CalendarViewMode,
	PriorityFilter,
} from "@/features/calendar/types";

type CalendarUIStore = {
	date: Date;
	view: CalendarViewMode;
	priority: PriorityFilter;
	projectId: string;
	anchorDate: Date | null;
	openTaskProjectSlug: string | null;

	setDate: (date: Date) => void;
	setView: (view: CalendarViewMode) => void;
	setPriority: (priority: PriorityFilter) => void;
	setProjectId: (projectId: string) => void;
	setAnchorDate: (date: Date | null) => void;
	setOpenTaskProjectSlug: (projectSlug: string | null) => void;

	goToToday: () => void;
	shift: (direction: -1 | 1) => void;
};

export const useCalendarUIStore = create<CalendarUIStore>((set) => ({
	date: new Date(),
	view: "month",
	priority: "all",
	projectId: "all",
	anchorDate: null,
	openTaskProjectSlug: null,

	setDate: (date) =>
		set({
			date,
		}),

	setView: (view) =>
		set({
			view,
		}),

	setPriority: (priority) =>
		set({
			priority,
		}),

	setProjectId: (projectId) =>
		set({
			projectId,
		}),

	setAnchorDate: (anchorDate) =>
		set({
			anchorDate,
		}),

	setOpenTaskProjectSlug: (openTaskProjectSlug) =>
		set({
			openTaskProjectSlug,
		}),

	goToToday: () =>
		set({
			date: new Date(),
			anchorDate: null,
		}),

	shift: (direction) =>
		set((state) => {
			if (state.view === "week") {
				return { date: addDays(startOfWeekLocal(state.date), direction * 7) };
			}

			return {
				date: new Date(
					state.date.getFullYear(),
					state.date.getMonth() + direction,
					1,
				),
			};
		}),
}));
