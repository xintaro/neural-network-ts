import { Polygon, RayPosition } from "./types";

export function linearInterpolation(A: number, B: number, t: number) {
	return A + (B - A) * t;
}

export function getIntersection(A: RayPosition | Polygon, B: RayPosition | Polygon, C: { x: number; y: number; }, D: { x: number; y: number; }) {
	const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
	const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
	const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

	if (bottom !== 0) {
		const t = tTop / bottom;
		const u = uTop / bottom;
		if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
			return {
				x: linearInterpolation(A.x, B.x, t),
				y: linearInterpolation(A.y, B.y, t),
				offset: t,
			};
		}
	}

	return null;
}

export function polysIntersect(polySet1: Polygon[], polySet2: Polygon[]) {
	for (let i = 0; i < polySet1.length; i++) {
		for (let j = 0; j < polySet2.length; j++) {
			const touch = getIntersection(
				polySet1[i],
				polySet1[(i + 1) % polySet1.length],
				polySet2[j],
				polySet2[(j + 1) % polySet2.length],
			);
			if (touch) {
				return true;
			}
		}
	}

	return false;
}

export function getRGBA(value: number){
    const alpha = Math.abs(value)
    const R = value < 0 ? 0:255
    const G = R
    const B = value > 0 ? 0:255
	return `rgba(${R},${G},${B},${alpha})`
}
