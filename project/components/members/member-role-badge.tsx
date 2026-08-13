import { cn } from "@/lib/utils";
import {
	getWorkspaceRoleLabel,
	WORKSPACE_ROLE_STYLES,
} from "@/lib/utils/workspace-members";
import type { WorkspaceMemberRole } from "@/types/workspace";

type MemberRoleBadgeProps = {
	role: WorkspaceMemberRole;
	className?: string;
};

export function MemberRoleBadge({ role, className }: MemberRoleBadgeProps) {
	const roleStyle = WORKSPACE_ROLE_STYLES[role];

	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium",
				roleStyle.bg,
				roleStyle.text,
				roleStyle.border,
				className,
			)}
		>
			<span className={cn("size-1.5 rounded-full", roleStyle.dot)} />
			{getWorkspaceRoleLabel(role)}
		</span>
	);
}
