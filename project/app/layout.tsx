import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import type React from "react";
import "./globals.css"; // FIX #2: Creating global.d.ts to declare module for CSS imports to avoid TypeScript errors - Done

// TODO: Task 2.1 - Set up Clerk authentication service - Complete
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemedToaster } from "@/components/themed-toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ReactQueryProvider } from "./providers/react-query-provider";

const geistHeading = Geist({ subsets: ["latin"], variable: "--font-heading" });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Fora",
	description: "Team collaboration and project management platform",
	generator: "v0.dev",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		// TODO: Task 2.1 - Wrap with ClerkProvider once Clerk is set up - Complete
		<ClerkProvider appearance={{ theme: shadcn }}>
			<html
				lang="en"
				suppressHydrationWarning
				className={cn(geistHeading.variable)}
			>
				<body
					className={`${inter.className} min-h-screen overflow-hidden bg-background text-foreground antialiased`}
				>
					<ThemeProvider>
						<TooltipProvider>
							<ReactQueryProvider>
								{children}
								<ThemedToaster />
							</ReactQueryProvider>
						</TooltipProvider>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
