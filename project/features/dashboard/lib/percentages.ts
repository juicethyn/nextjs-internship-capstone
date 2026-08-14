export function distributePercentages(values: number[]) {
	const total = values.reduce((sum, value) => sum + value, 0);

	if (total <= 0) return values.map(() => 0);

	const exact = values.map((value) => (value / total) * 100);
	const floored = exact.map((value) => Math.floor(value));

	let remaining = 100 - floored.reduce((sum, value) => sum + value, 0);

	const order = exact
		.map((value, index) => ({ index, remainder: value - Math.floor(value) }))
		.sort((a, b) => b.remainder - a.remainder);

	const result = [...floored];

	for (const { index } of order) {
		if (remaining <= 0) break;

		result[index] += 1;
		remaining -= 1;
	}

	return result;
}
