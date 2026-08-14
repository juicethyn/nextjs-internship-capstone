import type { LucideIcon } from "lucide-react";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

type StatCardProps = {
	title: string;
	value: number;
	icon: LucideIcon;
	hint?: string;
};

export function StatCard({ title, value, icon: Icon, hint }: StatCardProps) {
	return (
		<Card size="sm">
			<CardHeader>
				<CardTitle className="text-sm font-medium text-muted-foreground">
					{title}
				</CardTitle>

				<CardAction>
					<Icon className="size-4 text-muted-foreground" />
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
