import Image from "next/image";
import { cn } from "@/lib/utils";

type ForaLogoProps = {
	size?: number;
	className?: string;
};

export function ForaLogo({ size = 28, className }: ForaLogoProps) {
	return (
		<Image
			src="/icons/fora-icon.svg"
			alt="Fora"
			width={size}
			height={size}
			priority
			className={cn("block shrink-0", className)}
		/>
	);
}
