import { auth } from "@clerk/nextjs/server";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	await auth.protect(); // Protect the dashboard layout and its child routes for Task 2.6

	return <DashboardLayout>{children}</DashboardLayout>;
}
