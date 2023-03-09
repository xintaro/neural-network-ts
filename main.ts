import Road from './road'
import Car from './car'
import Visualizer from './visualizer'
import NeuralNetwork from './network';

const carCanvas = document.getElementById('carCanvas') as HTMLCanvasElement
carCanvas.width = 200

const networkCanvas = document.getElementById('networkCanvas') as HTMLCanvasElement
carCanvas.width = 300

const carContext = carCanvas.getContext('2d') as CanvasRenderingContext2D 
const networkContext = networkCanvas.getContext('2d') as CanvasRenderingContext2D 

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9)
const N = 100
const cars = generateCars(N)
let leadCar: Car | undefined = cars[0]

const previousWinner = localStorage.getItem("bestBrain")

if(previousWinner) {
	for (let i = 0; i < cars.length; i++) {
		cars[i].brain = JSON.parse(previousWinner)

		if(i !== 0) {
			NeuralNetwork.mutate(cars[i].brain, 0.2)
		}
	}
}

const traffic = [
	new Car(road.getLaneCenter(1), -100, 'TRAFFIC', 2),
	new Car(road.getLaneCenter(0), 130, 'TRAFFIC', 2),
	new Car(road.getLaneCenter(2), -280, 'TRAFFIC', 2),
	new Car(road.getLaneCenter(3), -10, 'TRAFFIC', 2),
	new Car(road.getLaneCenter(1), -500, 'TRAFFIC', 2),
	new Car(road.getLaneCenter(3), -500, 'TRAFFIC', 2),
	new Car(road.getLaneCenter(1), -800, 'TRAFFIC', 2),
	new Car(road.getLaneCenter(2), -800, 'TRAFFIC', 2),
	new Car(road.getLaneCenter(0), -950, 'TRAFFIC', 2),
	new Car(road.getLaneCenter(2), -900, 'TRAFFIC', 2)
]

animate(1000)

function save() {
	console.log('saved')
	localStorage.setItem("bestBrain", JSON.stringify(leadCar?.brain))
}

function discard() {
	console.log('cleared')
	localStorage.removeItem("bestBrain")
}

	const saveButton = document.createElement("BUTTON")
	saveButton.onclick = save
	saveButton.innerText = "SAVE"
	
	const discardButton = document.createElement("BUTTON")
	discardButton.onclick = discard
	discardButton.innerText = "DISCARD"
	
	const container = document.getElementById('vertical-button')

	container?.appendChild(saveButton)
	container?.appendChild(discardButton)
	container?.replaceChild(saveButton, container.childNodes[0])
	container?.replaceChild(discardButton, container.childNodes[1])



function generateCars(N: number) {
	const cars: Car[] = []

	for (let i = 1; i < N; i++) {
		cars.push(new Car(road.getLaneCenter(1), 100, "AI"))
	}

	return cars
}

function animate(time: number) {
	
	for (let i = 0; i < traffic.length; i++) {
		traffic[i].update(road.borders, [cars[0]])
	}

	for (const car of cars) {
		car.update(road.borders, traffic)
	}

	leadCar = cars.find(car => car.y === Math.min(...cars.map(c => c.y)))

	carCanvas.height = window.innerHeight
	networkCanvas.height = window.innerHeight

	carContext.save();
	carContext.translate(0, -(leadCar?.y ?? 0) + carCanvas.height * 0.7)
	
	road.draw(carContext)

	for (let i = 0; i < traffic.length; i++) {
		traffic[i].draw(carContext, 'olive')
	}

	carContext.globalAlpha = 0.2

	for (const car of cars) {
		car.draw(carContext, 'mediumslateblue')
	}

	carContext.globalAlpha = 1
	leadCar?.draw(carContext, 'mediumslateblue', true)
	
	carContext.restore()
	
	networkContext.lineDashOffset = -time/50
	Visualizer.drawNetwork(networkContext, leadCar?.brain as NeuralNetwork)
	
	requestAnimationFrame(animate);
}
