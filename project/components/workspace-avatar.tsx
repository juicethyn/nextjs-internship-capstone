import { cn } from "@/lib/utils";

interface Props {
	name: string;
	color: string;
	className?: string;
}

export function WorkspaceAvatar({ name, color, className }: Props) {
	return (
		<div
			className={cn(
				"flex size-16 items-center justify-center rounded-xl text-2xl font-bold text-white",
				className,
			)}
			style={{
				backgroundColor: color,
			}}
		>
			{name.charAt(0).toUpperCase()}
		</div>
	);
}
