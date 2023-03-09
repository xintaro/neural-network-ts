import Level from './level';
import { linearInterpolation } from './utils';

export default class NeuralNetwork {
    levels: Level[]
    constructor(neuronCounts: number[]) {
        this.levels = []

        for (let i = 0; i < neuronCounts.length-1; i++) {
            this.levels.push(new Level(
                neuronCounts[i],
                neuronCounts[i + 1]
            ))
        }
    }

    static feedForward(givenInputs: number[], network: NeuralNetwork) {
        let outputs =  Level.feedForward(givenInputs, network.levels[0])

        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedForward(outputs, network.levels[i])
        }

        return outputs
    }

    static mutate (network: NeuralNetwork | undefined, amount = 1) {
        if(!NeuralNetwork) return

        network?.levels.forEach(level => {
            for (let i = 0; i < level.biases.length; i++) {
                level.biases[i] = linearInterpolation(
                    level.biases[i],
                    Math.random()*2-1,
                    amount
                )
            }

            for (let i = 0; i < level.weights.length; i++) {
                for (let j = 0; j < level.weights[i].length; j++) {
                    level.weights[i][j] = linearInterpolation(
                        level.weights[i][j],
                        Math.random()*2-1,
                        amount
                    )
                }
            }
        });
    }
}