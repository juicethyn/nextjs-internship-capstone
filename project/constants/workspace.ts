import type { Occupation } from "@/lib/db/schema";

export const WORKSPACE_COLORS = [
	"#7C3AED", // Purple
	"#2563EB", // Blue
	"#059669", // Emerald
	"#EA580C", // Orange
	"#DC2626", // Red
	"#DB2777", // Pink
	"#0891B2", // Cyan
	"#0D9488", // Teal
	"#65A30D", // Lime
	"#CA8A04", // Yellow
	"#C2410C", // Deep Orange
	"#9333EA", // Violet
	"#4F46E5", // Indigo
];

// A tighter palette than WORKSPACE_COLORS — labels render small, so fewer and
// more distinguishable hues read better in a list.
export const LABEL_COLORS = [
	"#7C3AED", // Purple
	"#2563EB", // Blue
	"#059669", // Emerald
	"#EA580C", // Orange
	"#DC2626", // Red
	"#DB2777", // Pink
	"#0891B2", // Cyan
	"#CA8A04", // Yellow
];

export const OCCUPATIONS: {
	value: Occupation;
	label: string;
}[] = [
	{
		value: "software_engineer",
		label: "Software Engineer",
	},
	{
		value: "qa_engineer",
		label: "QA Engineer",
	},
	{
		value: "product_manager",
		label: "Product Manager",
	},
	{
		value: "designer",
		label: "Designer",
	},
	{
		value: "devops_engineer",
		label: "DevOps Engineer",
	},
	{
		value: "student",
		label: "Student",
	},
	{
		value: "other",
		label: "Other",
	},
];
