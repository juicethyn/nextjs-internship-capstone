import type { workspaceLabels } from "@/lib/db/schema";

export type WorkspaceLabel = typeof workspaceLabels.$inferSelect;
