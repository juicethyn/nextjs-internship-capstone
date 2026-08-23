import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ScreenshotFrameProps } from "../types";

export function ScreenshotFrame({
	src,
	alt,
	label,
	variant = "showcase",
	className,
}: ScreenshotFrameProps) {
	const isHero = variant === "hero";

	return (
		<div
			className={cn(
				"overflow-hidden rounded-2xl border border-white/[0.08]",
				isHero && "rounded-xl border-white/[0.09]",
				className,
			)}
			style={{
				boxShadow: isHero
					? "0 32px 96px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.05)"
					: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
			}}
		>
			<div
				className={cn(
					"flex items-center gap-1.5 border-white/[0.05] border-b bg-[#0b0b0b] px-4",
					isHero ? "h-9 gap-2" : "h-8",
				)}
			>
				<div className="flex gap-1.5">
					<span
						className={cn(
							"rounded-full bg-[#ff5f57]",
							isHero ? "size-2.5" : "size-2",
						)}
					/>
					<span
						className={cn(
							"rounded-full bg-[#ffbd2e]",
							isHero ? "size-2.5" : "size-2",
						)}
					/>
					<span
						className={cn(
							"rounded-full bg-[#28ca41]",
							isHero ? "size-2.5" : "size-2",
						)}
					/>
				</div>

				{isHero ? (
					<>
						<div className="flex flex-1 justify-center">
							<span className="h-4 w-48 rounded-md border border-white/[0.05] bg-white/[0.04]" />
						</div>
						<div className="w-[52px]" />
					</>
				) : null}
			</div>

			{src ? (
				<Image
					src={src}
					alt={alt}
					width={1600}
					height={1000}
					priority={isHero}
					className="block h-auto w-full"
				/>
			) : (
				<div className="flex aspect-[16/10] w-full items-center justify-center bg-[#0d0d0d]">
					<div className="flex flex-col items-center gap-3 rounded-xl border border-white/[0.09] border-dashed px-8 py-7 text-center">
						<ImageIcon className="size-6 text-white/25" strokeWidth={1.5} />
						<div className="space-y-1">
							<p className="font-medium text-[13px] text-white/45">{label}</p>
							<p className="text-[11px] text-white/20">
								Screenshot placeholder
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
