export const listTypes = ["todo", "in_progress", "done"] as const;

export type ListType = (typeof listTypes)[number];
