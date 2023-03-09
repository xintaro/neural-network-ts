export default class Level {
    inputs: number[]
    outputs: number[]
    biases: number[]
    weights: number[][]
    constructor(inputCount: number, outputCount: number) {
        this.inputs = new Array(inputCount)
        this.outputs = new Array(outputCount)
        this.biases = new Array(outputCount)

        this.weights = []
        
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] =  new Array(outputCount)
        }

        Level.#randomize(this)
    }

    static #randomize(level: Level) {
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j] = Math.random()*2-1
            }
        }

        for (let k = 0; k < level.biases.length; k++) {
            level.biases[k] = Math.random()*2-1
        }
    }


    static feedForward(givenInputs: number[], level: Level) {
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i]
        }

        for (let j = 0; j < level.outputs.length; j++) {
            let sum = 0

            for (let k = 0; k < level.inputs.length; k++) {
                sum += level.inputs[k] * level.weights[k][j]
            }


            level.outputs[j] = sum > level.biases[j] ? 1 : 0
        }

        return level.outputs
    }
}