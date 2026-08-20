"use client";

import { MemberAvatarStack } from "@/features/projects/components/member-avatar-stack";
import { useProjectUIStore } from "@/features/projects/store";

export function BoardViewers() {
	const viewers = useProjectUIStore((state) => state.boardViewers);

	if (viewers.length === 0) return null;

	return (
		<div className="flex items-center gap-2">
			<MemberAvatarStack members={viewers} max={3} />

			<span className="hidden text-xs text-muted-foreground sm:inline">
				viewing now
			</span>
		</div>
	);
}
