import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const workspaceAvatarVariants = cva(
	"flex shrink-0 items-center justify-center rounded-xl font-bold text-white",
	{
		variants: {
			size: {
				xs: "size-6 rounded-md text-[10px]", // collapsed sidebar icon, dropdown rows
				sm: "size-8 rounded-lg text-sm", // expanded sidebar header
				md: "size-12 rounded-xl text-lg", // workspace lists/cards
				lg: "size-16 rounded-xl text-2xl", // onboarding (your original default)
				xl: "size-24 rounded-2xl text-4xl", // onboarding hero step
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
