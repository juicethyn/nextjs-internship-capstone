"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WORKSPACE_COLORS } from "@/constants/workspace";
import { createWorkspaceSchema } from "@/lib/validations/workspace";
import { useWorkspaceSetupStore } from "@/stores/workspace-setup-store";
import { Input } from "../ui/input";
import { WorkspaceAvatar } from "../workspace-avatar";

type WorkspaceStepProps = {
	onNext: () => void;
};

export function WorkspaceStep({ onNext }: WorkspaceStepProps) {
	const { workspace, setWorkspace } = useWorkspaceSetupStore();

	const [name, setName] = useState(workspace?.name ?? "");
	const [color, setColor] = useState(workspace?.color ?? WORKSPACE_COLORS[0]);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = () => {
		const result = createWorkspaceSchema.safeParse({ name, color });

		if (!result.success) {
			setError(result.error.issues[0].message);

			return;
		}

		setError(null);
		setWorkspace(result.data);
		onNext();
	};

	return (
		<div className="mx-auto w-full max-w-xl space-y-4 lg:space-y-5">
			<div>
				<h2 className="text-xl lg:text-3xl font-bold">Name your workspace</h2>
				<p className="mt-1 text-sm text-muted-foreground lg:mt-2 lg:text-sm">
					This is how your team will identify this workspace. You can change it
					anytime.
				</p>
			</div>

			<div className="rounded-2xl border bg-muted p-3 sm:p-4 lg:p-5">
				<div className="flex items-center gap-3 sm:gap-4">
					<WorkspaceAvatar name={name || "F"} color={color} />

					<div className="min-w-0 flex-1">
						<h3 className="truncate text-base font-semibold sm:text-lg">
							{name || "Fora"}
						</h3>

						<p className="text-xs text-muted-foreground sm:text-sm">
							This is how your workspace will appear.
						</p>
					</div>
				</div>
			</div>

			<div className="space-y-4">
				<div>
					<label
						className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
						htmlFor="workspace-name"
					>
						Workspace Name
					</label>
					<Input
						value={name}
						id="workspace-name"
						onChange={(e) => setName(e.target.value)}
						maxLength={50}
						placeholder="e.g. Fora"
						className="mt-1 sm:mt-2 h-10 bg-muted! focus:bg-background transition-colors"
						required
					/>
					{error && <p className="text-sm text-destructive mt-1">{error}</p>}
				</div>

				<div>
					<label
						className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
						htmlFor="workspace-color"
					>
						Workspace Color
					</label>

					<div className="mt-3 flex flex-wrap gap-2 sm:gap-3">
						{WORKSPACE_COLORS.map((workspaceColor, index) => (
							<button
								key={workspaceColor}
								type="button"
								onClick={() => setColor(workspaceColor)}
								className={`
									size-6.5 rounded-full transition sm:size-8
									${index >= 10 ? "hidden lg:block" : ""}
									${color === workspaceColor ? "ring-2 ring-primary ring-offset-2" : ""}
								`}
								style={{
									backgroundColor: workspaceColor,
								}}
							/>
						))}
					</div>
				</div>
			</div>

			<Button
				onClick={handleSubmit}
				disabled={!name.trim()}
				className="h-11 w-full sm:h-12"
			>
				Continue
			</Button>
		</div>
	);
}
