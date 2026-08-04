import type { Occupation } from "@/lib/db/schema";

export const WORKSPACE_COLORS = [
	"#7C3AED", // Purple
	"#2563EB", // Blue
	"#059669", // Green
	"#EA580C", // Orange
	"#DC2626", // Red
	"#DB2777", // Pink
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
