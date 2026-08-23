"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { instrumentSerif } from "@/fonts";
import { cn } from "@/lib/utils";
import { HERO_SCREENSHOT } from "../constants";
import { ScreenshotFrame } from "./screenshot-frame";

export function LandingHero() {
	return (
		<section className="relative overflow-hidden px-6 pt-36 pb-0 md:pt-44">
			<div
				className="pointer-events-none absolute top-0 left-1/2 h-150 w-225 -translate-x-1/2"
				style={{
					background:
						"radial-gradient(ellipse at 50% 0%, rgba(130,0,219,0.18) 0%, transparent 65%)",
				}}
			/>

			<div className="relative z-10 mx-auto mb-16 max-w-175 text-center">
				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 0.1 }}
					className={cn(
						instrumentSerif.className,
						"mb-6 text-[54px] text-white leading-[1.05] tracking-tight md:text-[70px]",
					)}
				>
					Built for <em className="text-[#b06aff] italic">focused</em>
					<br />
					teams.
				</motion.h1>

				<motion.p
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.65, delay: 0.2 }}
					className="mb-10 text-[18px] text-white/50 leading-relaxed"
				>
					Fora brings your projects, tasks, and team together — so you can focus
					on work that actually moves the needle.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="flex items-center justify-center gap-3"
				>
					<Button
						asChild
						size="lg"
						className="h-12 gap-2 px-8 font-semibold text-[14px] hover:shadow-lg hover:shadow-primary/30"
					>
						<Link href="/sign-up">
							Start for free
							<ArrowRight className="size-4" />
						</Link>
					</Button>
				</motion.div>
			</div>

			<div className="relative z-10 px-0 md:px-6">
				<div className="relative mx-auto w-full max-w-260 select-none">
					<div
						className="-z-10 pointer-events-none absolute inset-0"
						style={{
							background:
								"radial-gradient(ellipse at 50% 70%, rgba(130,0,219,0.22) 0%, transparent 65%)",
							filter: "blur(40px)",
							transform: "scale(1.1) translateY(8%)",
						}}
					/>

					<motion.div
						initial={{ opacity: 0, y: 44, scale: 0.97 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						transition={{
							duration: 0.9,
							delay: 0.3,
							ease: [0.21, 0.47, 0.32, 0.98],
						}}
					>
						<ScreenshotFrame
							variant="hero"
							src={HERO_SCREENSHOT.src}
							label={HERO_SCREENSHOT.label}
							alt="Fora kanban board — Q4 Product Launch project"
						/>
					</motion.div>

					<div
						className="pointer-events-none absolute inset-x-0 bottom-0 h-32 rounded-b-xl"
						style={{
							background: "linear-gradient(to top, #080808 30%, transparent)",
						}}
					/>
				</div>
			</div>
		</section>
	);
}
