"use client";

import { useState } from "react";
import { useLists } from "@/hooks/use-lists";
import { createListSchema } from "@/lib/validations/list";
import { useUIStore } from "@/stores/ui-store";
import type { CreatableListType } from "@/types/list";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

type CreateListDialogProps = {
	workspaceSlug: string;
	projectSlug: string;
};

const LIST_TYPE_OPTIONS: { value: CreatableListType; label: string }[] = [
	{ value: "todo", label: "To Do" },
	{ value: "in_progress", label: "In Progress" },
];

const DEFAULT_TYPE: CreatableListType = "todo";

export function CreateListDialog({
	workspaceSlug,
	projectSlug,
}: CreateListDialogProps) {
	const isCreateListOpen = useUIStore((state) => state.isCreateListOpen);
	const setCreateListOpen = useUIStore((state) => state.setCreateListOpen);

	const { createList, isCreating } = useLists({ workspaceSlug, projectSlug });

	const [name, setName] = useState("");
	const [type, setType] = useState<CreatableListType>(DEFAULT_TYPE);
	const [error, setError] = useState<string | null>(null);

	const resetForm = () => {
		setName("");
		setType(DEFAULT_TYPE);
		setError(null);
	};

	const handleOpenChange = (open: boolean) => {
		setCreateListOpen(open);

		if (!open) {
			resetForm();
		}
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		const parsed = createListSchema.safeParse({ name: name.trim(), type });

		if (!parsed.success) {
			setError(
				parsed.error.issues[0]?.message ?? "Please check the list details.",
			);
			return;
		}

		setError(null);

		const result = await createList(parsed.data).catch(() => null);

		if (result?.success) {
			handleOpenChange(false);
		}
	};

	return (
		<Dialog open={isCreateListOpen} onOpenChange={handleOpenChange}>
			<DialogContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<DialogHeader>
						<DialogTitle className="text-base">Create list</DialogTitle>

						<DialogDescription className="text-xs leading-relaxed">
							Add a new column to this board.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-2">
						<Label htmlFor="list-name">List name</Label>

						<Input
							id="list-name"
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="e.g. In Review"
							maxLength={100}
							autoFocus
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="list-type">List type</Label>

						<Select
							value={type}
							onValueChange={(value) => setType(value as CreatableListType)}
						>
							<SelectTrigger id="list-type" className="w-full">
								<SelectValue />
							</SelectTrigger>

							<SelectContent>
								{LIST_TYPE_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{error && <p className="text-xs text-destructive">{error}</p>}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
						>
							Cancel
						</Button>

						<Button type="submit" disabled={isCreating || !name.trim()}>
							{isCreating ? "Creating..." : "Create list"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
