"use client";

import { Loader2Icon } from "lucide-react";
import { useEffect, useRef } from "react";

type SyncRedirectProps = {
	to: string;
};

export function SyncRedirect({ to }: SyncRedirectProps) {
	const hasRedirected = useRef(false);

	useEffect(() => {
		if (hasRedirected.current) {
			return;
		}

		hasRedirected.current = true;
		window.location.replace(to);
	}, [to]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<Loader2Icon className="size-6 animate-spin text-muted-foreground" />
			<span className="sr-only">Taking you to your workspace</span>
		</div>
	);
}
