import { cn } from "@/lib/utils";
import type { SetupStepConfig } from "@/types/workspace-setup";

type SetupSidebarProps = {
	steps: SetupStepConfig[];
	currentIndex: number;
};

export function SetupSidebar({ steps, currentIndex }: SetupSidebarProps) {
	return (
		<aside className="hidden w-80 flex-col border-r bg-muted/30 p-8 lg:flex">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Fora</h1>

				<p className="mt-2 text-sm text-muted-foreground">
					Complete your workspace setup.
				</p>

				<p className="mt-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
					Step {currentIndex + 1} of {steps.length}
				</p>
			</div>

			{/* Steps */}
			<div className="mt-10 space-y-8">
				{steps.map((step, index) => {
					const active = index === currentIndex;
					const completed = index < currentIndex;

					return (
						<div key={step.step} className="flex gap-4">
							<div className="relative flex flex-col items-center">
								<div
									className={cn(
										"z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
										completed && "bg-primary text-primary-foreground",
										active &&
											"border-2 border-primary bg-background text-primary",
										!active && !completed && "bg-muted text-muted-foreground",
									)}
								>
									{completed ? "✓" : index + 1}
								</div>

								{index !== steps.length - 1 && (
									<div
										className={cn(
											"absolute top-9 h-8 w-px",
											completed ? "bg-primary" : "bg-border",
										)}
									/>
								)}
							</div>

							<div className="pt-1">
								<p
									className={cn(
										"text-sm font-semibold",
										active || completed
											? "text-foreground"
											: "text-muted-foreground",
									)}
								>
									{step.title}
								</p>

								<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
									{step.description}
								</p>
							</div>
						</div>
					);
				})}
			</div>

			<div className="mt-auto pt-8">
				<p className="text-xs text-muted-foreground">
					You can always update these settings later.
				</p>
			</div>
		</aside>
	);
}
