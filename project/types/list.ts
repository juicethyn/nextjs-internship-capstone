export const listTypes = ["todo", "in_progress", "done"] as const;

export type ListType = (typeof listTypes)[number];

export const creatableListTypes = ["todo", "in_progress"] as const;

export type CreatableListType = (typeof creatableListTypes)[number];
