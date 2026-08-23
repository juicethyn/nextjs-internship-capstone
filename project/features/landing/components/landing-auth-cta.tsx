"use client";

import { useAuth } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type LandingAuthCtaProps = {
	variant?: "desktop" | "mobile";
	onNavigate?: () => void;
};

export function LandingAuthCta({
	variant = "desktop",
	onNavigate,
}: LandingAuthCtaProps) {
	const { isLoaded, isSignedIn } = useAuth();
	const isMobile = variant === "mobile";

	if (!isLoaded) {
		return isMobile ? (
			<div className="h-10 w-full animate-pulse rounded-lg bg-white/[0.06]" />
		) : (
			<div className="h-9 w-[132px] animate-pulse rounded-lg bg-white/[0.06]" />
		);
	}

	if (isSignedIn) {
		return (
			<Button
				asChild
				size="lg"
				className={
					isMobile
						? "h-10 w-full gap-2 font-semibold text-[14px]"
						: "h-9 gap-1.5 px-5 font-semibold text-[13px]"
				}
			>
				<Link href="/sync" onClick={onNavigate}>
					Go to app
					<ArrowRight className={isMobile ? "size-4" : "size-3.5"} />
				</Link>
			</Button>
		);
	}

	if (isMobile) {
		return (
			<>
				<Link
					href="/sign-in"
					onClick={onNavigate}
					className="block py-2 text-[14px] text-white/60 transition-colors hover:text-white"
				>
					Sign in
				</Link>
				<Button
					asChild
					size="lg"
					className="h-10 w-full gap-2 font-semibold text-[14px]"
				>
					<Link href="/sign-up" onClick={onNavigate}>
						Get started free
						<ArrowRight className="size-4" />
					</Link>
				</Button>
			</>
		);
	}

	return (
		<>
			<Link
				href="/sign-in"
				className="px-3 py-1.5 text-[13px] text-white/50 transition-colors hover:text-white/90"
			>
				Sign in
			</Link>
			<Button
				asChild
				size="lg"
				className="h-9 gap-1.5 px-5 font-semibold text-[13px]"
			>
				<Link href="/sign-up">
					Get started
					<ArrowRight className="size-3.5" />
				</Link>
			</Button>
		</>
	);
}
