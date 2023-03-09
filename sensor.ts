import {getIntersection, linearInterpolation} from './utils'
import type Car from './car'
import { Ray, RayPosition, RoadBorders } from './types'

export default class Sensor {
	car: Car
	rayCount: number
	rayLength: number
	raySpread: number
	type: string
	rays: [RayPosition, RayPosition][]
	readings: Array<{
		x: number;
		y: number;
		offset: number;
	} | null | undefined>
	constructor(vehicle: Car, type: string) {
		this.car = vehicle
		this.rayCount = 9
		this.rayLength = 180
		this.raySpread = Math.PI * 0.7
		this.type = type

		this.rays = []
		this.readings = []
	}

	update(roadBorders: RoadBorders, traffic: Car[]) {
		this.#castRays();
		this.readings = [];
		for (let i = 0; i < this.rays.length; i++) {
			this.readings.push(
				this.#getReading(this.rays[i], roadBorders, traffic),
			);
		}
	}

	#getReading(ray: Ray, roadBorders: RoadBorders, traffic: Car[]) {
		const touches = []; 

		for (let i = 0; i < roadBorders.length; i++) {
			const touch = getIntersection(ray[0], ray[1], roadBorders[i][0], roadBorders[i][1]);

			if (touch) {
				touches.push(touch);
			}
		}

		for (let i = 0; i < traffic.length; i++) {
			const {polygon} = traffic[i];

			for (let j = 0; j < polygon.length; j++) {
				const value = getIntersection(ray[0], ray[1], polygon[j], polygon[(j + 1) % polygon.length]);
				if (value) {
					touches.push(value);
				}
			}
		}

		if (touches.length === 0) {
			return null;
		}

		const offsets = touches.map(touch => touch.offset);
		const minOffset = Math.min(...offsets);

		return touches.find(touch => touch.offset === minOffset);
	}

	#castRays() {
		this.rays = [];

		for (let i = 0; i < this.rayCount; i++) {
			const rayAngle = linearInterpolation(
				this.raySpread / 2,
				-this.raySpread / 2,
				this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1),
			) + this.car.angle;

			const start = {x: this.car.x, y: this.car.y};
			const end = {
				x: this.car.x - Math.sin(rayAngle) * this.rayLength,
				y: this.car.y - Math.cos(rayAngle) * this.rayLength,
			};

			this.rays.push([start, end]);
		}
	}

	draw(ctx: CanvasRenderingContext2D | null) {
		if (!ctx) return

		for (let i = 0; i < this.rayCount; i++) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			let end: any = this.rays[i][1];
			if (this.readings[i]) {
				end = this.readings[i];
			}

			ctx.beginPath();
			ctx.lineWidth = 2;
			ctx.strokeStyle = 'yellow';
			ctx.moveTo(
				this.rays[i][0].x,
				this.rays[i][0].y,
			);
			ctx.lineTo(
				end.x,
				end.y,
			);
			ctx.stroke();

			ctx.beginPath();
			ctx.lineWidth = 2;
			ctx.strokeStyle = 'orangered';
			ctx.moveTo(
				this.rays[i][1].x,
				this.rays[i][1].y,
			);
			ctx.lineTo(
				end.x,
				end.y,
			);
			ctx.stroke();
		}
	}
}
