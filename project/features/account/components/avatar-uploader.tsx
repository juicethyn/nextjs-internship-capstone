"use client";

import { useUser } from "@clerk/nextjs";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MAX_AVATAR_BYTES } from "@/features/account/constants";
import { useAccountSettings } from "@/features/account/hooks/use-account-settings";
import { getInitials, memberDisplayName } from "@/lib/user-display";

type AvatarUploaderProps = {
	firstName: string;
	lastName: string;
	email: string;
	imageUrl: string | null;
};

export function AvatarUploader({
	firstName,
	lastName,
	email,
	imageUrl,
}: AvatarUploaderProps) {
	const { user } = useUser();
	const { syncAvatar } = useAccountSettings();

	const inputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setUploading] = useState(false);

	const name = memberDisplayName({ firstName, lastName, email });

	const handleFile = async (file: File) => {
		if (!file.type.startsWith("image/")) {
			toast.error("Choose an image file.");
			return;
		}

		if (file.size > MAX_AVATAR_BYTES) {
			toast.error("Images must be 4MB or smaller.");
			return;
		}

		if (!user) return;

		setUploading(true);

		try {
			const updated = await user.setProfileImage({ file });

			await syncAvatar(updated.publicUrl ?? user.imageUrl);
		} catch {
			toast.error("Failed to upload avatar.");
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="flex min-w-0 items-center gap-4 rounded-2xl border bg-muted p-4">
			<Avatar className="size-14 shrink-0">
				{imageUrl && <AvatarImage src={imageUrl} alt={name} />}

				<AvatarFallback>{getInitials(firstName, lastName)}</AvatarFallback>
			</Avatar>

			<div className="min-w-0 flex-1">
				<h3 className="truncate text-base font-semibold">{name}</h3>

				<p className="truncate text-xs text-muted-foreground">{email}</p>
			</div>

			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				className="hidden"
				onChange={(event) => {
					const file = event.target.files?.[0];

					if (file) handleFile(file);

					event.target.value = "";
				}}
			/>

			<Button
				type="button"
				variant="ghost"
				size="sm"
				disabled={isUploading || !user}
				onClick={() => inputRef.current?.click()}
				className="shrink-0"
			>
				{isUploading ? "Uploading..." : "Change Avatar"}
			</Button>
		</div>
	);
}
