import type { RoadBorders } from './types'
import {linearInterpolation} from './utils'

export default class Road {
	x: number
	width: number
	lanes: number
	left: number
	right: number
	top: number
	bottom: number
	borders: RoadBorders
	constructor(xPos: number, roadwidth: number, lanes = 4) {
		this.x = xPos
		this.width = roadwidth
		this.lanes = lanes

		this.left = xPos - roadwidth / 2
		this.right = xPos + roadwidth / 2

		const infinity = 1000000

		this.top = -infinity
		this.bottom = infinity

		const topLeft = {x: this.left, y: this.top}
		const topRight = {x: this.right, y: this.top}
		const bottomLeft = {x: this.left, y: this.bottom}
		const bottomRight = {x: this.right, y: this.bottom}
		this.borders = [
			[topLeft, bottomLeft],
			[topRight, bottomRight],
		]
	}

	getLaneCenter(laneIndex: number) {
		const laneWidth = this.width / this.lanes
		return this.left + laneWidth / 2 + Math.min(laneIndex, this.lanes - 1) * laneWidth
	}

	draw(ctx: CanvasRenderingContext2D | null) {
		if (!ctx) return

		ctx.lineWidth = 5
		ctx.strokeStyle = 'white'

		for (let i = 1; i <= this.lanes - 1; i++) {
			const x = linearInterpolation(
				this.left,
				this.right,
				i / this.lanes,
			)

			ctx.setLineDash([20, 20])
			ctx.beginPath()
			ctx.moveTo(x, this.top)
			ctx.lineTo(x, this.bottom)
			ctx.stroke()
		}

		ctx.setLineDash([])

		this.borders.forEach(border => {
			ctx.beginPath()
			ctx.moveTo(border[0].x, border[0].y)
			ctx.lineTo(border[1].x, border[1].y)
			ctx.stroke()
		})
	}
}
