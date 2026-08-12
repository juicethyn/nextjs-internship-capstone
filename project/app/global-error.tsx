"use client";

import { useEffect } from "react";
import "./globals.css";

type GlobalErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<html lang="en">
			<body className="bg-background text-foreground antialiased">
				<div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
					<div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
						{/* Inline SVG rather than lucide: this tree renders when the app
						    shell is broken, so it should pull in as little as possible. */}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="size-8 text-muted-foreground"
							role="img"
							aria-label="Warning"
						>
							<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
							<path d="M12 9v4" />
							<path d="M12 17h.01" />
						</svg>
					</div>

					<h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
						Something went wrong
					</h1>

					<p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
						The application failed to load. Reloading usually clears it.
					</p>

					<button
						type="button"
						onClick={reset}
						className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Reload
					</button>
				</div>
			</body>
		</html>
	);
}
