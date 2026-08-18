import { RANK_COLORS, UNRANKED_COLOR } from "../constants";

export function getRankColor(index: number) {
	return RANK_COLORS[index] ?? UNRANKED_COLOR;
}

export function getBarPercent(count: number, max: number) {
	if (max <= 0) return 0;

	return Math.round((count / max) * 100);
}
