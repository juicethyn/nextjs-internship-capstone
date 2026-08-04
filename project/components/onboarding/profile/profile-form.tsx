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
		<div className="space-y-2">
			<label className="text-sm font-medium" htmlFor="your-role">
				Your Role
			</label>

			<Select
				value={selectedOccupation ?? ""}
				onValueChange={(value) => updateOccupation(value as Occupation)}
			>
				<SelectTrigger>
					<SelectValue placeholder="Select your role" />
				</SelectTrigger>

				<SelectContent>
					{OCCUPATIONS.map((item) => (
						<SelectItem key={item.value} value={item.value}>
							{item.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
