"use client";

import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";

type ErrorPageProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<ErrorState
			icon={TriangleAlert}
			title="Something went wrong"
			description="An unexpected error occurred while loading this page. Trying again will re-run it — if it keeps failing, head back to your dashboard."
		>
			<Button
				type="button"
				size="lg"
				onClick={reset}
				className="w-full sm:w-auto"
			>
				Try again
			</Button>

			<Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
				<Link href="/sync">Back to dashboard</Link>
			</Button>
		</ErrorState>
	);
}
