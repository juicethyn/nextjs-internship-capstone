import { LockKeyhole } from "lucide-react";
import Link from "next/link";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

export const metadata = {
	title: "Sign in required",
};

export default function UnauthorizedPage() {
	return (
		<ErrorState
			icon={LockKeyhole}
			title="Sign in required"
			description="You need to be signed in to view this page. Sign in and we'll bring you right back."
		>
			<Button asChild size="lg" className="w-full sm:w-auto">
				<Link href="/sign-in">Sign in</Link>
			</Button>

			<Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
				<Link href="/">Go home</Link>
			</Button>
		</ErrorState>
	);
}
