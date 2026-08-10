"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../ui/tooltip";

type StackMember = {
	id: string;
	firstName: string;
	lastName: string;
	imageUrl: string | null;
};

type MemberAvatarStackProps = {
	members: StackMember[];
	max?: number;
	className?: string;
};

function getInitials(member: StackMember) {
	return `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase();
}

function getFullName(member: StackMember) {
	return `${member.firstName} ${member.lastName}`.trim();
}

export function MemberAvatarStack({
	members,
	max = 4,
	className,
}: MemberAvatarStackProps) {
	if (members.length === 0) {
		return null;
	}

	const visibleMembers = members.slice(0, max);
	const remainingMembers = members.slice(max);

	return (
		<TooltipProvider>
			<div className={cn("flex items-center -space-x-2", className)}>
				{visibleMembers.map((member) => (
					<Tooltip key={member.id}>
						<TooltipTrigger asChild>
							<Avatar className="size-7 ring-2 ring-background transition-transform hover:z-10 hover:scale-105">
								{member.imageUrl && (
									<AvatarImage
										src={member.imageUrl}
										alt={getFullName(member)}
									/>
								)}

								<AvatarFallback>{getInitials(member)}</AvatarFallback>
							</Avatar>
						</TooltipTrigger>

						<TooltipContent>{getFullName(member)}</TooltipContent>
					</Tooltip>
				))}

				{remainingMembers.length > 0 && (
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-background">
								+{remainingMembers.length}
							</div>
						</TooltipTrigger>

						<TooltipContent>
							{remainingMembers.map(getFullName).join(", ")}
						</TooltipContent>
					</Tooltip>
				)}
			</div>
		</TooltipProvider>
	);
}
