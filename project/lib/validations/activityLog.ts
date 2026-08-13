import type { ActivityAction, EntityType } from "@/lib/db/types";

export type CreateActivityInput = {
	workspaceId: string;
	actorId: string;
	action: ActivityAction;
	entity: EntityType;
	entityId: string;
	metadata?: unknown;
};
