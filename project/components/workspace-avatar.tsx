import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const workspaceAvatarVariants = cva(
	"flex shrink-0 items-center justify-center font-bold text-white",
	{
		variants: {
			size: {
				xs: "size-5 rounded-md text-[9px] sm:size-6 sm:text-[10px]",
				sm: "size-7 rounded-lg text-xs sm:size-8 sm:text-sm",
				md: "size-10 rounded-xl text-base sm:size-12 sm:text-lg",
				lg: "size-12 rounded-xl text-xl sm:size-16 sm:text-2xl",
				xl: "size-16 rounded-2xl text-2xl sm:size-24 sm:text-4xl",
			},
		},
		defaultVariants: {
			size: "lg",
		},
	},
);

interface WorkspaceAvatarProps
	extends VariantProps<typeof workspaceAvatarVariants> {
	name: string;
	color: string;
	className?: string;
}

export function WorkspaceAvatar({
	name,
	color,
	size,
	className,
}: WorkspaceAvatarProps) {
	return (
		<div
			className={cn(workspaceAvatarVariants({ size }), className)}
			style={{ backgroundColor: color }}
		>
			{name.charAt(0).toUpperCase()}
		</div>
	);
}
