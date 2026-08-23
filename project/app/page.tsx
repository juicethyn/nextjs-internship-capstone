import { LandingFeatures } from "@/features/landing/components/landing-features";
import { LandingFooter } from "@/features/landing/components/landing-footer";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { LandingNav } from "@/features/landing/components/landing-nav";
import { LandingShowcase } from "@/features/landing/components/landing-showcase";

export default function LandingPage() {
	return (
		<div
			data-landing
			className="dark min-h-screen overflow-x-hidden bg-[#080808] text-[#e8e8e8]"
		>
			<div
				className="pointer-events-none fixed inset-0 z-0"
				style={{
					backgroundImage:
						"radial-gradient(rgba(255,255,255,0.032) 1px, transparent 1px)",
					backgroundSize: "28px 28px",
				}}
			/>

			<LandingNav />
			<LandingHero />
			<LandingFeatures />
			<LandingShowcase />
			<LandingFooter />
		</div>
	);
}
