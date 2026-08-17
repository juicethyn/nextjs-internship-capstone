import type { LucideIcon } from "lucide-react";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
	title: string;
	value: number;
	icon: LucideIcon;
	hint?: string;
	iconClassName?: string;
};

export function StatCard({
	title,
	value,
	icon: Icon,
	hint,
	iconClassName,
}: StatCardProps) {
	return (
		<Card size="sm">
			<CardHeader>
				<CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
					{title}
				</CardTitle>

				<CardAction>
					<Icon
						className={cn("size-4", iconClassName ?? "text-muted-foreground")}
					/>
				</CardAction>
			</CardHeader>

			<CardContent className="space-y-1">
				<p className="text-2xl font-semibold tabular-nums leading-none">
					{value}
				</p>

				{hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
			</CardContent>
		</Card>
	);
}
