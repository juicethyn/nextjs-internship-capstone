"use client";

import { motion } from "motion/react";
import type React from "react";

type FadeProps = {
	children: React.ReactNode;
	delay?: number;
	className?: string;
	y?: number;
};

export function Fade({ children, delay = 0, className, y = 20 }: FadeProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-60px" }}
			transition={{ duration: 0.65, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
			className={className}
		>
			{children}
		</motion.div>
	);
}
