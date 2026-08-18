import { CalendarClient } from "@/features/calendar/components/calendar-client";

type CalendarPageProps = {
	params: Promise<{
		workspaceSlug: string;
	}>;
};

export default async function CalendarPage({ params }: CalendarPageProps) {
	const { workspaceSlug } = await params;

	return (
		<div className="-mx-4 -my-8 sm:-mx-6 lg:-mx-8 lg:h-[calc(100%+4rem)]">
			<CalendarClient workspaceSlug={workspaceSlug} />
		</div>
	);
}
