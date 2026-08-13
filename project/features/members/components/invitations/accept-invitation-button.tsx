"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { acceptWorkspaceInvitationAction } from "@/features/members/actions/workspaceInvitations";

type Props = {
	token: string;
};

export function AcceptInvitationButton({ token }: Props) {
	const router = useRouter();

	const [pending, startTransition] = useTransition();

	const handleAccept = () => {
		startTransition(async () => {
			const result = await acceptWorkspaceInvitationAction(token);

			if (!result.success) {
				toast.error(result.message);

				return;
			}

			toast.success("Invitation accepted!");

			router.push(`/w/${result.data?.workspaceSlug}/dashboard`);
		});
	};

	return (
		<Button className="w-full" onClick={handleAccept} disabled={pending}>
			{pending ? "Joining workspace..." : "Accept Invitation"}
		</Button>
	);
}
