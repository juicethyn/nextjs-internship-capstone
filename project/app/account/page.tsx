import { currentUser } from "@clerk/nextjs/server";
import { AccountHeader } from "@/features/account/components/account-header";
import { AvatarUploader } from "@/features/account/components/avatar-uploader";
import { ProfileForm } from "@/features/account/components/profile-form";
import { getCurrentUser } from "@/lib/auth";

export default async function AccountPage() {
	const user = await getCurrentUser();

	const clerkUser = await currentUser();

	const email = clerkUser?.primaryEmailAddress?.emailAddress ?? user.email;

	return (
		<div className="space-y-6">
			<AccountHeader
				title="Account"
				description="Manage your profile and login credentials."
			/>

			<AvatarUploader
				firstName={user.firstName}
				lastName={user.lastName}
				email={email}
				imageUrl={user.imageUrl}
			/>

			<ProfileForm
				firstName={user.firstName}
				lastName={user.lastName}
				email={email}
				occupation={user.occupation}
			/>
		</div>
	);
}
