"use client";

import { useCallback, useRef, useState } from "react";

const DRAG_THRESHOLD = 3;

export function useDragScroll<T extends HTMLElement>() {
	const ref = useRef<T>(null);
	const [isDragging, setIsDragging] = useState(false);

	const origin = useRef<{
		pointerId: number;
		x: number;
		scrollLeft: number;
		engaged: boolean;
	} | null>(null);

	const onPointerDown = useCallback((event: React.PointerEvent<T>) => {
		if (event.pointerType !== "mouse" || event.button !== 0) return;

		if (event.target !== event.currentTarget) return;

		const element = ref.current;
		if (!element) return;

		origin.current = {
			pointerId: event.pointerId,
			x: event.clientX,
			scrollLeft: element.scrollLeft,
			engaged: false,
		};
	}, []);

	const onPointerMove = useCallback((event: React.PointerEvent<T>) => {
		const start = origin.current;
		const element = ref.current;

		if (!start || !element || start.pointerId !== event.pointerId) return;

		const delta = event.clientX - start.x;

		if (!start.engaged) {
			if (Math.abs(delta) < DRAG_THRESHOLD) return;

			start.engaged = true;
			element.setPointerCapture(event.pointerId);
			setIsDragging(true);
		}

		element.scrollLeft = start.scrollLeft - delta;
	}, []);

	const endDrag = useCallback((event: React.PointerEvent<T>) => {
		const start = origin.current;
		const element = ref.current;

		if (!start || start.pointerId !== event.pointerId) return;

		if (start.engaged && element?.hasPointerCapture(event.pointerId)) {
			element.releasePointerCapture(event.pointerId);
		}

		origin.current = null;
		setIsDragging(false);
	}, []);

	return {
		ref,
		isDragging,
		dragHandlers: {
			onPointerDown,
			onPointerMove,
			onPointerUp: endDrag,
			onPointerCancel: endDrag,
		},
	};
}
