import { instrumentSerif } from "@/fonts";
import { cn } from "@/lib/utils";
import { ForaLogo } from "./fora-logo";

export function LandingFooter() {
	return (
		<footer className="relative z-10 border-white/[0.06] border-t px-6 py-8">
			<div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-4 md:flex-row">
				<div className="flex items-center gap-2.5">
					<ForaLogo size={22} />
					<span
						className={cn(instrumentSerif.className, "text-[17px] text-white")}
					>
						Fora
					</span>
				</div>

				<p className="text-[12px] text-white/25">
					© {new Date().getFullYear()} Fora. All rights reserved.
				</p>

				<div className="flex items-center gap-2">
					<span className="size-1.5 animate-pulse rounded-full bg-[#10b981]" />
					<span className="text-[12px] text-white/25">
						All systems operational
					</span>
				</div>
			</div>
		</footer>
	);
}
