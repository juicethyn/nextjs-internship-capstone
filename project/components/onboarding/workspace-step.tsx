"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WORKSPACE_COLORS } from "@/constants/workspace";
import { createWorkspaceSchema } from "@/lib/validations/workspace";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { ONBOARDING_STEPS } from "@/types/onboarding";
import { Input } from "../ui/input";
import { WorkspaceAvatar } from "../workspace-avatar";

type Props = {
	onNext: () => void;
	currentStep: number;
};

export function WorkspaceStep({ onNext, currentStep }: Props) {
	const setWorkspace = useOnboardingStore((state) => state.setWorkspace);
	const [name, setName] = useState("");
	const [color, setColor] = useState(WORKSPACE_COLORS[0]);
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
		<div className="space-y-6">
			<div>
				<p>
					STEP {currentStep} of {ONBOARDING_STEPS.length}
				</p>
				<h2 className="text-3xl font-bold">Name your workspace</h2>

				<p className="text-muted-foreground mt-2">
					This is how your team will identify this workspace. You can change it
					anytime.
				</p>
			</div>

			<WorkspaceAvatar name={name || "F"} color={color} />

			<div className="space-y-4">
				<div>
					<label className="text-sm font-medium" htmlFor="workspace-name">
						Workspace Name
					</label>
					<Input
						value={name}
						id="workspace-name"
						onChange={(e) => setName(e.target.value)}
						placeholder="e.g. Fora Team"
						required
					/>
					{error && <p className="text-sm text-destructive mt-1">{error}</p>}
				</div>

				<div>
					<label className="text-sm font-medium" htmlFor="workspace-color">
						Workspace Color
					</label>

					<div className="mt-3 flex gap-3">
						{WORKSPACE_COLORS.map((workspaceColor) => (
							<button
								key={workspaceColor}
								type="button"
								onClick={() => setColor(workspaceColor)}
								className={`size-8 rounded-full transition ${
									color === workspaceColor
										? "ring-2 ring-primary ring-offset-2"
										: ""
								}`}
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
				className="w-full h-12"
			>
				Continue
			</Button>
		</div>
	);
}
