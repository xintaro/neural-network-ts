import Sensor from './sensor'
import Controls from './controls'
import {polysIntersect} from './utils'
import { RoadBorders } from './types'
import NeuralNetwork from './network';

export default class Car {
	originalX: number
	type: string
	originalY: number
	x: number
	y: number
	width: number
	height: number
	speed: number
	acceleration: number
	maxSpeed: number
	maxReverseSpeed: number
	friction: number
	turnSpeed: number
	angle: number
	polygon: Array<{
		x: number
		y: number
	}>
	damaged: boolean
	sensor?: Sensor
	controls: Controls
	brain?: NeuralNetwork;
	useBrain: boolean;

	constructor(x: number, y: number, type: string, maxSpeed = 3, width = 30, height = 50) {
		this.originalX = x
		this.type = type
		this.originalY = y
		this.x = x
		this.y = y
		this.width = width
		this.height = height

		this.speed = 0
		this.acceleration = 0.006

		this.maxSpeed = maxSpeed
		this.maxReverseSpeed = -0.5
		this.friction = 0.003

		this.turnSpeed = 0.001
		this.angle = 0
		this.polygon = this.#createPolygon()

		this.damaged = false

		this.useBrain = type === 'AI'

		if(type !== 'TRAFFIC') {
			this.sensor = new Sensor(this, type)
			this.brain = new NeuralNetwork(
				[this.sensor.rayCount, 9, 4]
			)
		}

		this.controls = new Controls(type)
	}

	#reset() {
		this.x = this.originalX
		this.y = this.originalY

		this.speed = 0
		this.acceleration = 0.2

		this.friction = 0.005

		this.angle = 0

		this.damaged = false
	}

	update(roadBorders: RoadBorders, traffic: Car[]) {
		if (!this.damaged) {
			this.#move()
			this.polygon = this.#createPolygon()
			this.damaged = this.#assessDamage(roadBorders, traffic)
		}

		if(this.sensor && this.brain) {
			this.sensor.update(roadBorders, traffic)

			const offsets = this.sensor.readings.map(reading => reading === null ? 0 : 1 - (reading?.offset ?? 0))
			const outputs = NeuralNetwork.feedForward(offsets, this.brain)
			if(this.useBrain) {
				this.controls.forward = !!outputs[0]
				this.controls.left = !!outputs[1]
				this.controls.right = !!outputs[2]
				this.controls.reverse = !!outputs[3]
			}
		}

	}

	#assessDamage(roadBorders: RoadBorders, traffic: Car[]) {
		for (let i = 0; i < roadBorders.length; i++) {
			if (polysIntersect(this.polygon, roadBorders[i])) {
				return true
			}
		}

		for (let j = 0; j < traffic.length; j++) {
			if (polysIntersect(this.polygon, traffic[j].polygon)) {
				return true
			}
		}

		return false
	}

	#move() {
		if (this.controls.forward) {
			this.speed += this.acceleration
		}

		if (this.controls.reverse) {
			this.speed -= this.acceleration
		}

		if (this.speed > this.maxSpeed) {
			this.speed = this.maxSpeed
		}

		if (this.speed < this.maxReverseSpeed) {
			this.speed = this.maxReverseSpeed
		}

		if (this.speed > 0) {
			this.speed -= this.friction
		}

		if (this.speed < 0) {
			this.speed += this.friction
		}

		if (Math.abs(this.speed) < this.friction) {
			this.speed = 0
		}

		if (this.speed !== 0) {
			const flip = this.speed > 0 ? 1 : -1
			if (this.controls.left) {
				this.angle += this.turnSpeed * flip
			}

			if (this.controls.right) {
				this.angle -= this.turnSpeed * flip
			}
		}

		this.x -= Math.sin(this.angle) * this.speed
		this.y -= Math.cos(this.angle) * this.speed
	}

	#createPolygon() {
		const points = []
		const radius = Math.hypot(this.width, this.height) / 2
		const alpha = Math.atan2(this.width, this.height)

		points.push({
			x: this.x - Math.sin(this.angle - alpha) * radius,
			y: this.y - Math.cos(this.angle - alpha) * radius,
		})

		points.push({
			x: this.x - Math.sin(this.angle + alpha) * radius,
			y: this.y - Math.cos(this.angle + alpha) * radius,
		})

		points.push({
			x: this.x - Math.sin(Math.PI + this.angle - alpha) * radius,
			y: this.y - Math.cos(Math.PI + this.angle - alpha) * radius,
		})

		points.push({
			x: this.x - Math.sin(Math.PI + this.angle + alpha) * radius,
			y: this.y - Math.cos(Math.PI + this.angle + alpha) * radius,
		})

		return points
	}

	draw(ctx: CanvasRenderingContext2D | null, color: string, drawSensor= false) {
		if (!ctx) return

		if (this.damaged) {
			ctx.fillStyle = 'gray'
		} else {
			ctx.fillStyle = color
		}
		

		ctx.beginPath()
		ctx.moveTo(this.polygon[0].x, this.polygon[0].y)
		for (let i = 1; i < this.polygon.length; i++) {
			ctx.lineTo(this.polygon[i].x, this.polygon[i].y)
		}

		ctx.fill()

		drawSensor && this.sensor?.draw(ctx)
	}
}
