"use client";

import { TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContinueWorking } from "@/features/dashboard/hooks/use-continue-working";
import { ContinueWorkingItem } from "./continue-working-item";
import { ContinueWorkingSkeleton } from "./continue-working-skeleton";

type ContinueWorkingProps = {
	workspaceSlug: string;
};

export function ContinueWorking({ workspaceSlug }: ContinueWorkingProps) {
	const { data, isLoading, isError } = useContinueWorking({ workspaceSlug });

	if (isLoading) {
		return <ContinueWorkingSkeleton />;
	}

	return (
		<Card className="h-full">
			<CardHeader className="border-b pb-3">
				<CardTitle>Continue Working</CardTitle>
			</CardHeader>

			<CardContent>
				{isError || !data ? (
					<div className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
						<TriangleAlert className="size-4 shrink-0" />
						<span>Couldn't load your recent projects.</span>
					</div>
				) : data.length === 0 ? (
					<p className="py-6 text-sm text-muted-foreground">
						No projects yet. Create one to get started.
					</p>
				) : (
					<div className="space-y-3">
						{data.map((project) => (
							<ContinueWorkingItem
								key={project.id}
								project={project}
								workspaceSlug={workspaceSlug}
							/>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
