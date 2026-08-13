import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { SetupStepConfig } from "@/features/workspace/setup/types";
import { SetupSidebar } from "./setup-sidebar";

type SetupLayoutProps = {
	steps: SetupStepConfig[];
	currentIndex: number;
	onClose?: () => void;
	children: ReactNode;
};

export function SetupLayout({
	steps,
	currentIndex,
	onClose,
	children,
}: SetupLayoutProps) {
	return (
		<div className="relative flex h-screen w-screen bg-background">
			<SetupSidebar steps={steps} currentIndex={currentIndex} />

			<div className="flex flex-1 items-center justify-center">
				<div className="w-full max-w-2xl px-3 sm:px-6 lg:px-8">{children}</div>
			</div>

			{onClose && (
				<Button
					onClick={onClose}
					variant="ghost"
					className="absolute right-6 top-6"
				>
					<X />
				</Button>
			)}
		</div>
	);
}
