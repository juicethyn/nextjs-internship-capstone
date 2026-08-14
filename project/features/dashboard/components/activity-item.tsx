"use client";

import { WorkspaceAvatar } from "@/components/shared/workspace-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { RecentActivityItem } from "@/features/dashboard/hooks/use-recent-activity";
import {
	activityPhrase,
	activityTitle,
} from "@/features/dashboard/lib/activity-text";
import { formatCommentTimestamp, formatFullDate } from "@/lib/date-formatter";
import { getInitials, memberDisplayName } from "@/lib/user-display";

type ActivityItemProps = {
	activity: RecentActivityItem;
};

export function ActivityItem({ activity }: ActivityItemProps) {
	const { actor, project } = activity;

	const name = memberDisplayName(actor);
	const phrase = activityPhrase(activity.action, activity.entity);
	const title = activityTitle(activity.metadata);
	const createdAt = new Date(activity.createdAt);

	return (
		<li className="flex items-start gap-3 border-b py-3 last:border-b-0">
			<Avatar className="mt-0.5 size-8 shrink-0">
				{actor.imageUrl && <AvatarImage src={actor.imageUrl} alt={name} />}

				<AvatarFallback className="text-[10px]">
					{getInitials(actor.firstName, actor.lastName)}
				</AvatarFallback>
			</Avatar>

			<div className="min-w-0 flex-1 space-y-1">
				<div className="flex min-w-0 items-start justify-between gap-3">
					<p className="min-w-0 text-sm leading-snug">
						<span className="font-medium">{name}</span>{" "}
						<span className="text-muted-foreground">{phrase}</span>
						{title && <span className="font-medium"> “{title}”</span>}
					</p>

					<time
						dateTime={createdAt.toISOString()}
						title={formatFullDate(createdAt)}
						className="shrink-0 text-[11px] text-muted-foreground"
					>
						{formatCommentTimestamp(createdAt)}
					</time>
				</div>

				{project && (
					<div className="flex min-w-0 items-center gap-1.5">
						<WorkspaceAvatar
							name={project.name}
							color={project.color}
							size="xs"
						/>

						<span className="min-w-0 truncate text-xs text-muted-foreground">
							{project.name}
						</span>
					</div>
				)}
			</div>
		</li>
	);
}
