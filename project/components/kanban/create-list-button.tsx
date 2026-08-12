"use client";

import { Plus } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "../ui/button";

export function CreateListButton() {
	const openCreateList = useUIStore((state) => state.openCreateList);

	return (
		<Button
			type="button"
			variant="ghost"
			onClick={openCreateList}
			className="
				flex
				w-full
				shrink-0
				snap-start
				flex-col
				items-center
				justify-center
				gap-2
				self-stretch
				rounded-xl
				border-2
				border-dashed
				py-10
				text-muted-foreground
				transition-colors
				hover:border-primary/40
				hover:bg-muted/50
				hover:text-foreground
				focus-visible:outline-2
				focus-visible:outline-offset-2
				focus-visible:outline-ring
				sm:w-72
			"
		>
			<div className="flex flex-row gap-3">
				<Plus className="size-5" />
				<span className="text-sm font-medium">Create List</span>
			</div>
		</Button>
	);
}
