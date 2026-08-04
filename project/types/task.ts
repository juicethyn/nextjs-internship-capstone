export const taskPriorities = ["none", "low", "medium", "high"] as const;

export type TaskPriority = (typeof taskPriorities)[number];
