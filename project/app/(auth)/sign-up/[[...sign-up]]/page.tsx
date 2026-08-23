// TODO: Task 2.3 - Create sign-in and sign-up pages
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-platinum-900 dark:bg-outer_space-600 px-4">
			<div className="w-full max-w-md">
				<SignUp />
			</div>
		</div>
	);
}
