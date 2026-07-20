import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import type React from "react";
import "./globals.css";
// TODO: Task 2.1 - Set up Clerk authentication service
// import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const geistHeading = Geist({ subsets: ["latin"], variable: "--font-heading" });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Project Management Tool",
	description: "Team collaboration and project management platform",
	generator: "v0.dev",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		// TODO: Task 2.1 - Wrap with ClerkProvider once Clerk is set up
		// <ClerkProvider>
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(geistHeading.variable)}
		>
			<body className={inter.className}>
				<ThemeProvider>{children}</ThemeProvider>
			</body>
		</html>
		// </ClerkProvider>
	);
}
