"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { instrumentSerif } from "@/fonts";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "../constants";
import { ForaLogo } from "./fora-logo";
import { LandingAuthCta } from "./landing-auth-cta";

export function LandingNav() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header
			className={cn(
				"fixed inset-x-0 top-0 z-50 transition-all duration-300",
				scrolled
					? "border-white/[0.06] border-b bg-[#080808]/80 backdrop-blur-xl"
					: "bg-transparent",
			)}
		>
			<div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-6">
				<Link href="/" className="flex shrink-0 items-center gap-2.5">
					<ForaLogo size={28} />
					<span
						className={cn(
							instrumentSerif.className,
							"text-[19px] text-white tracking-tight",
						)}
					>
						Fora
					</span>
				</Link>

				<nav className="hidden items-center gap-8 md:flex">
					{NAV_LINKS.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className="text-[13px] text-white/50 transition-colors hover:text-white/90"
						>
							{link.label}
						</a>
					))}
				</nav>

				<div className="hidden items-center gap-3 md:flex">
					<LandingAuthCta />
				</div>

				<Button
					variant="ghost"
					size="icon"
					onClick={() => setMobileOpen((open) => !open)}
					className="size-9 text-white/50 hover:bg-white/5 hover:text-white md:hidden"
				>
					{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
					<span className="sr-only">Toggle navigation</span>
				</Button>
			</div>

			{mobileOpen ? (
				<div className="space-y-1 border-white/[0.06] border-t bg-[#0d0d0d]/95 px-6 py-5 backdrop-blur-xl md:hidden">
					{NAV_LINKS.map((link) => (
						<a
							key={link.href}
							href={link.href}
							onClick={() => setMobileOpen(false)}
							className="block py-2.5 text-[14px] text-white/60 transition-colors hover:text-white"
						>
							{link.label}
						</a>
					))}

					<div className="mt-4 space-y-3 border-white/[0.06] border-t pt-4">
						<LandingAuthCta
							variant="mobile"
							onNavigate={() => setMobileOpen(false)}
						/>
					</div>
				</div>
			) : null}
		</header>
	);
}
