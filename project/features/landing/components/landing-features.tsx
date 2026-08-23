"use client";

import { instrumentSerif } from "@/fonts";
import { cn } from "@/lib/utils";
import { FEATURES } from "../constants";
import { Fade } from "./fade";

export function LandingFeatures() {
	return (
		<section id="features" className="relative z-10 px-6 pt-20 pb-28">
			<div className="mx-auto max-w-[1180px]">
				<Fade className="mb-16">
					<p className="mb-4 font-semibold text-[#8200db] text-[11px] uppercase tracking-[0.18em]">
						What Fora does
					</p>
					<h2
						className={cn(
							instrumentSerif.className,
							"max-w-[520px] text-[42px] text-white leading-[1.1] tracking-tight md:text-[52px]",
						)}
					>
						Everything a team needs,{" "}
						<em className="text-[#b06aff] italic">nothing</em> it doesn&apos;t.
					</h2>
				</Fade>

				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{FEATURES.map((feature, index) => {
						const Icon = feature.icon;

						return (
							<Fade key={feature.num} delay={index * 0.08}>
								<div className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0f0f0f] p-6 transition-all duration-300 hover:border-white/[0.13]">
									<span
										className="pointer-events-none absolute top-4 right-5 select-none font-bold text-[44px] leading-none"
										style={{
											color: `${feature.color}12`,
											fontFamily: "var(--font-heading)",
										}}
									>
										{feature.num}
									</span>

									<div
										className="mb-5 flex size-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
										style={{
											backgroundColor: `${feature.color}18`,
											color: feature.color,
										}}
									>
										<Icon className="size-5" />
									</div>

									<h3 className="mb-2.5 pr-6 font-semibold text-[15px] text-white leading-snug">
										{feature.title}
									</h3>
									<p className="text-[13px] text-white/45 leading-relaxed">
										{feature.body}
									</p>

									<div
										className="absolute right-0 bottom-0 left-0 h-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
										style={{
											background: `linear-gradient(90deg, ${feature.color}, transparent)`,
										}}
									/>
								</div>
							</Fade>
						);
					})}
				</div>
			</div>
		</section>
	);
}
