import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import type React from "react";
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import { ThemedToaster } from "@/components/shared/themed-toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

const geistHeading = Geist({ subsets: ["latin"], variable: "--font-heading" });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	metadataBase: new URL("https://foraapp.me"),

	title: "Fora",
	description:
		"Plan projects, manage tasks, and collaborate with your team in Fora.",

	openGraph: {
		title: "Fora — Project Management for Focused Teams",
		description:
			"Plan projects, manage tasks, and collaborate with your team in Fora.",
		type: "website",
		siteName: "Fora",
		images: [
			{
				url: "/images/fora-preview.png",
				width: 1200,
				height: 630,
				alt: "Fora — Project Management for Focused Teams",
			},
		],
	},
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
