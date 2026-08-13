import { ShieldX } from "lucide-react";
import Link from "next/link";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

export const metadata = {
	title: "Access denied",
};

export default function ForbiddenPage() {
	return (
		<ErrorState
			icon={ShieldX}
			title="Access denied"
			description="You don't have permission to view this page. If you think this is a mistake, ask a workspace owner or admin for access."
		>
			{/* /sync resolves the user's current workspace server-side, so it works
			    from here where no workspaceSlug is in scope. */}
			<Button asChild size="lg" className="w-full sm:w-auto">
				<Link href="/sync">Back to dashboard</Link>
			</Button>
		</ErrorState>
	);
}
