import type { Occupation } from "@/lib/db/schema";

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
