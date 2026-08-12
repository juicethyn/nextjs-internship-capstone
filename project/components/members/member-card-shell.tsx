import { Mail } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MemberCardShellProps = {
	avatar: ReactNode;
	title: string;
	subtitle: ReactNode;
	badge: ReactNode;
	trailing?: ReactNode;
	email: string;
	status: ReactNode;
	footerLeft: ReactNode;
	footerRight: ReactNode;
	dimmed?: boolean;
};

export function MemberCardShell({
	avatar,
	title,
	subtitle,
	badge,
	trailing,
	email,
	status,
	footerLeft,
	footerRight,
	dimmed = false,
}: MemberCardShellProps) {
	return (
		<div
			className={cn(
				`
					flex
					flex-col
					gap-4
					rounded-xl
					border
					bg-card
					p-4
					transition-colors
					hover:border-primary/30
					sm:p-5
				`,
				dimmed && "opacity-60",
			)}
		>
			<div className="flex items-start justify-between gap-2">
				<div className="flex min-w-0 items-center gap-2.5">
					{avatar}

					<div className="min-w-0">
						<h3 className="truncate text-sm font-semibold">{title}</h3>

						{subtitle}
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-1">
					{badge}

					{trailing}
				</div>
			</div>

			<div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
				<div className="flex min-w-0 items-center gap-1.5">
					<Mail className="size-3.5 shrink-0" />

					<span className="truncate">{email}</span>
				</div>

				{status}
			</div>

			<div className="mt-auto flex items-center justify-between gap-3 border-t pt-3 text-[11px] text-muted-foreground">
				{footerLeft}

				{footerRight}
			</div>
		</div>
	);
}
