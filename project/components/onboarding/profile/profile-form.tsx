"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { OCCUPATIONS } from "@/constants/workspace";
import type { Occupation } from "@/lib/db/schema";

type ProfileFormProps = {
	selectedOccupation: Occupation | null;
	updateOccupation: (occupation: Occupation) => void;
};

export function ProfileForm({
	selectedOccupation,
	updateOccupation,
}: ProfileFormProps) {
	return (
		<div>
			<label
				className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
				htmlFor="occupation-select"
			>
				Your Role
			</label>

			<Select
				value={selectedOccupation ?? ""}
				onValueChange={(value) => updateOccupation(value as Occupation)}
			>
				<SelectTrigger className="w-full h-10! bg-muted/40">
					<SelectValue placeholder="Select your role" className="" />
				</SelectTrigger>

				<SelectContent
					sideOffset={6}
					className="w-(--radix-select-trigger-width)"
				>
					{OCCUPATIONS.map((item) => (
						<SelectItem
							key={item.value}
							value={item.value}
							className="h-9 text-sm"
						>
							{item.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
