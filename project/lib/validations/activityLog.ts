import type { ActivityAction, EntityType } from "../../types/activityLog";

export type CreateActivityInput = {
	workspaceId: string;
	actorId: string;
	action: ActivityAction;
	entity: EntityType;
	entityId: string;
	metadata?: unknown;
};
