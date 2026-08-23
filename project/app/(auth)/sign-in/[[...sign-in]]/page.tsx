// TODO: Task 2.3 - Create sign-in and sign-up pages
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-platinum-900 dark:bg-outer_space-600 px-4">
			<div className="max-w-md">
				<SignIn />
			</div>
		</div>
	);
}
