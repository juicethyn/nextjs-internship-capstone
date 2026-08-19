type ThemePreviewProps = {
	variant: "light" | "dark";
};

// Hardcoded so that the preview is consistent regardless of the user's actual theme preference.
const PALETTES = {
	light: {
		page: "#ffffff",
		panel: "#f4f4f5",
		bar: "#e4e4e7",
		accent: "#8200db",
		border: "#e4e4e7",
	},
	dark: {
		page: "#18181b",
		panel: "#27272a",
		bar: "#3f3f46",
		accent: "#a855f7",
		border: "#3f3f46",
	},
} as const;

export function ThemePreview({ variant }: ThemePreviewProps) {
	const palette = PALETTES[variant];

	return (
		<div
			aria-hidden="true"
			className="flex h-28 gap-1.5 overflow-hidden rounded-md border p-1.5"
			style={{ backgroundColor: palette.page, borderColor: palette.border }}
		>
			<div
				className="flex w-1/4 flex-col gap-1 rounded-sm p-1.5"
				style={{ backgroundColor: palette.panel }}
			>
				<div
					className="h-1.5 w-full rounded-full"
					style={{ backgroundColor: palette.accent }}
				/>

				<div
					className="h-1.5 w-3/4 rounded-full"
					style={{ backgroundColor: palette.bar }}
				/>

				<div
					className="h-1.5 w-2/3 rounded-full"
					style={{ backgroundColor: palette.bar }}
				/>
			</div>

			<div className="flex flex-1 flex-col gap-1.5">
				<div
					className="h-3 w-full rounded-sm"
					style={{ backgroundColor: palette.panel }}
				/>

				<div className="flex flex-1 gap-1.5">
					<div
						className="flex-1 rounded-sm"
						style={{ backgroundColor: palette.panel }}
					/>

					<div
						className="flex-1 rounded-sm"
						style={{ backgroundColor: palette.panel }}
					/>
				</div>

				<div
					className="h-1.5 w-1/2 rounded-full"
					style={{ backgroundColor: palette.bar }}
				/>
			</div>
		</div>
	);
}
