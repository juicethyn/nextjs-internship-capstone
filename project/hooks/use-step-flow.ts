"use client";

import { useState } from "react";

export function useStepFlow<TStep>(steps: TStep[]) {
	const [index, setIndex] = useState(0);

	const next = () =>
		setIndex((current) => Math.min(current + 1, steps.length - 1));
	const back = () => setIndex((current) => Math.max(current - 1, 0));

	return {
		step: steps[index],
		index,
		isFirstStep: index === 0,
		isLastStep: index === steps.length - 1,
		next,
		back,
	};
}
