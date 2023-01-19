import {field, model, Model, Factory} from "../../src";

export class LatLng {
  constructor(public readonly lat: number, public readonly lng: number) {
  }
}

class LatLngFactory extends Factory<any, LatLng> {

  parse(input: any): LatLng {
    return new LatLng(input["lat"], input["lng"])
  }

  value(input: LatLng): any {
    return {
      lat: input.lat,
      lng: input.lat
    }
  }
}

@model()
export class ModelWithFactoryType extends Model<ModelWithFactoryType>() {

  @field({type: LatLngFactory})
  location?: LatLng

}