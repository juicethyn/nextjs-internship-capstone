import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
	icon: LucideIcon;
	title: string;
	description: string;
	children?: ReactNode;
	className?: string;
};

export function ErrorState({
	icon: Icon,
	title,
	description,
	children,
	className,
}: ErrorStateProps) {
	return (
		<div
			className={cn(
				// Full viewport rather than 60vh — these pages render directly inside
				// the root layout with no dashboard shell around them.
				"flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center",
				className,
			)}
		>
			<div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
				<Icon className="size-8 text-muted-foreground" />
			</div>

			<h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
				{title}
			</h1>

			<p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
				{description}
			</p>

			{children && (
				<div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
					{children}
				</div>
			)}
		</div>
	);
}
