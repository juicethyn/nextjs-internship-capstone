import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

export const metadata = {
	title: "Page not found",
};

export default function NotFound() {
	return (
		<ErrorState
			icon={FileQuestion}
			title="Page not found"
			description="This page doesn't exist, or the project you're looking for may have been deleted or renamed."
		>
			<Button asChild size="lg" className="w-full sm:w-auto">
				<Link href="/sync">Back to dashboard</Link>
			</Button>

			<Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
				<Link href="/">Go home</Link>
			</Button>
		</ErrorState>
	);
}
