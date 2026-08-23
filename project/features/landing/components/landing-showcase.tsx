"use client";

import { Check } from "lucide-react";
import { instrumentSerif } from "@/fonts";
import { cn } from "@/lib/utils";
import { FEATURE_TABS } from "../constants";
import { Fade } from "./fade";
import { ScreenshotFrame } from "./screenshot-frame";

export function LandingShowcase() {
	return (
		<section id="how-it-works" className="relative z-10 px-6 py-20">
			<div className="mx-auto max-w-[1180px]">
				<Fade className="mb-20">
					<p className="mb-4 font-semibold text-[#8200db] text-[11px] uppercase tracking-[0.18em]">
						See it in action
					</p>
					<h2
						className={cn(
							instrumentSerif.className,
							"max-w-[560px] text-[42px] text-white leading-[1.1] tracking-tight md:text-[52px]",
						)}
					>
						One workspace, <em className="text-[#b06aff] italic">every</em> tool
						your team needs.
					</h2>
				</Fade>

				<div className="space-y-24">
					{FEATURE_TABS.map((tab, index) => {
						const isReversed = index % 2 !== 0;

						return (
							<Fade key={tab.id} delay={0.05}>
								<div
									className={cn(
										"grid items-center gap-12 lg:gap-16",
										isReversed
											? "lg:grid-cols-[1.6fr_1fr]"
											: "lg:grid-cols-[1fr_1.6fr]",
									)}
								>
									<div className={cn(isReversed && "lg:order-2")}>
										<p
											className="mb-4 font-semibold text-[11px] uppercase tracking-[0.18em]"
											style={{ color: tab.accent }}
										>
											{String(index + 1).padStart(2, "0")} — {tab.label}
										</p>

										<h3
											className={cn(
												instrumentSerif.className,
												"mb-5 text-[30px] text-white leading-[1.12] tracking-tight md:text-[38px]",
											)}
										>
											{tab.headline}
										</h3>

										<p className="mb-8 text-[15px] text-white/45 leading-relaxed">
											{tab.body}
										</p>

										<ul className="space-y-3">
											{tab.bullets.map((bullet) => (
												<li
													key={bullet}
													className="flex items-start gap-3 text-[13px] text-white/60"
												>
													<span
														className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full"
														style={{ backgroundColor: `${tab.accent}18` }}
													>
														<Check
															className="size-3"
															style={{ color: tab.accent }}
														/>
													</span>
													{bullet}
												</li>
											))}
										</ul>
									</div>

									<div className={cn("relative", isReversed && "lg:order-1")}>
										<div
											className="-inset-4 -z-10 pointer-events-none absolute rounded-3xl opacity-40"
											style={{
												background: `radial-gradient(ellipse at 50% 60%, ${tab.accent}40 0%, transparent 70%)`,
												filter: "blur(32px)",
											}}
										/>

										<ScreenshotFrame
											src={tab.image}
											label={`${tab.label} view`}
											alt={`Fora ${tab.label.toLowerCase()}`}
										/>
									</div>
								</div>
							</Fade>
						);
					})}
				</div>
			</div>
		</section>
	);
}
