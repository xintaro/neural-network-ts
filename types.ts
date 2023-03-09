export type Polygon = {
    x: number;
    y: number;
    offset?: number
}

export type RoadBorders = Polygon[][]

export interface RayPosition {
    x: number
    y: number
    offset?: number
}

export type Ray = [RayPosition, RayPosition]