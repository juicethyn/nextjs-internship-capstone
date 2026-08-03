"use client";

import { Briefcase } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { OCCUPATIONS } from "@/constants/workspace";
import { completeOnboardingAction } from "@/lib/actions/onboarding";
import type { Occupation } from "@/lib/db/schema";
import { useOnboardingStore } from "@/stores/onboarding-store";

type Props = {
	onBack: () => void;
	currentStep: number;
};

export function ProfileStep({ onBack }: Props) {
	const { workspace, invites, occupation, setOccupation } =
		useOnboardingStore();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [value, setValue] = useState<Occupation | null>(occupation);

	const handleSubmit = async () => {
		if (!workspace || !value) return;

		setIsSubmitting(true);
		setOccupation(value);

		try {
			await completeOnboardingAction({
				workspace,
				invites,
				occupation: value,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-8">
			<div>
				<div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10">
					<Briefcase className="size-6 text-primary" />
				</div>

				<h2 className="text-3xl font-bold">Tell us about yourself</h2>

				<p className="mt-2 text-sm text-muted-foreground">
					This helps personalize your workspace experience.
				</p>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium" htmlFor="your-role">
					Your Role
				</label>

				<Select
					value={value ?? ""}
					onValueChange={(value) => setValue(value as Occupation)}
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

			<div className="flex justify-between pt-4">
				<Button variant="ghost" onClick={onBack}>
					Back
				</Button>

				<Button disabled={!value} onClick={handleSubmit}>
					{isSubmitting ? "Creating workspace..." : "Finish Setup"}
				</Button>
			</div>
		</div>
	);
}
