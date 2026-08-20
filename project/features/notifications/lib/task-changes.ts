export function hasDueDateDayChanged(previous: Date | null, next: Date | null) {
	if (!previous && !next) return false;
	if (!previous || !next) return true;

	return previous.toDateString() !== next.toDateString();
}

export type AssignmentChange = {
	assignedTo: string | null;
	unassignedFrom: string | null;
};

export function resolveAssignmentChange(
	previous: string | null,
	next: string | null,
): AssignmentChange {
	if (previous === next) {
		return { assignedTo: null, unassignedFrom: null };
	}

	return { assignedTo: next, unassignedFrom: previous };
}
