"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type InvitationErrorProps = {
	message: string;
};

export function InvitationError({ message }: InvitationErrorProps) {
	return (
		<Card className="w-full max-w-md">
			<CardHeader className="text-center">
				<div
					className="
						mx-auto
						flex
						size-12
						items-center
						justify-center
						rounded-full
						bg-destructive/10
					"
				>
					<AlertCircle className="size-6 text-destructive" />
				</div>

				<CardTitle className="mt-4">Invalid Invitation</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4 text-center">
				<p className="text-sm text-muted-foreground">{message}</p>

				<Button variant="outline" onClick={() => (window.location.href = "/")}>
					Return Home
				</Button>
			</CardContent>
		</Card>
	);
}
