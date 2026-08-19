type AccountHeaderProps = {
	title: string;
	description: string;
};

export function AccountHeader({ title, description }: AccountHeaderProps) {
	return (
		<div className="space-y-1">
			<h1 className="text-2xl font-bold">{title}</h1>

			<p className="text-sm text-muted-foreground">{description}</p>
		</div>
	);
}
