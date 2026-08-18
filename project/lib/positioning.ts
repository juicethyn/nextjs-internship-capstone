export const POSITION_STEP = 1000;

// Below this gap a midpoint stops producing a meaningfully distinct double, so
// the owning list gets renumbered before the move is applied.
const MIN_GAP = 0.001;

export function calculatePosition(prev?: number, next?: number) {
	if (prev === undefined && next === undefined) {
		return POSITION_STEP;
	}

	if (prev === undefined) {
		return (next as number) / 2;
	}

	if (next === undefined) {
		return prev + POSITION_STEP;
	}

	return (prev + next) / 2;
}

export function needsRebalance(prev?: number, next?: number) {
	if (prev === undefined || next === undefined) {
		return false;
	}

	return Math.abs(next - prev) < MIN_GAP;
}

// Evenly spaced positions for a renumbered list: 1000, 2000, 3000, ...
export function buildRebalancedPositions(count: number) {
	return Array.from(
		{ length: count },
		(_, index) => (index + 1) * POSITION_STEP,
	);
}
