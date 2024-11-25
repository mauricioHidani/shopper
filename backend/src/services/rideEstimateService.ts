import axios from "axios";
import "dotenv/config";

import { RideEstimateRequest } from "../models/requests/rideEstimateRequest";
import { DriverRepository } from "../repositories/driverRepository";
import { GeocodeResponse } from "src/models/responses/geocodeResponse";
import { InvalidDataError } from "src/errors/invalidDataError";

class RideEstimateService {

  private driverRepository: DriverRepository;

  constructor(driverRepository: DriverRepository) {
    this.driverRepository = driverRepository;
  }

  async execute(request: RideEstimateRequest) {
    if (this.isCustomerIdNonExists(request)) {
      throw new InvalidDataError("A identificação do cliente é obrigatória");
    }

    if (this.isDestinationNonExists(request) || this.isOriginNonExists(request)) {
      throw new InvalidDataError("O destino ou a origem do percurso não podem estar vázios");
    }

    if (request.destination === request.origin) {
      throw new InvalidDataError("O destino e a origem do percurso não podem ser os mesmos");
    }

    const apiKey = process.env.GOOGLE_API_KEY as string;

    const destination = encodeURIComponent(request.destination);
    const origin = encodeURIComponent(request.origin);

    const originGeocodeMaps = await this.findGeocodeMaps(origin, apiKey);
    const destinationGeocodeMaps = await this.findGeocodeMaps(destination, apiKey);
    const routeMaps = await this.findMatrixRouteGoogleMaps(destinationGeocodeMaps, originGeocodeMaps, apiKey);
    const distance = routeMaps["rows"][0]["elements"][0]["distance"]["value"] / 1000;
    const duration = routeMaps["rows"][0]["elements"][0]["duration"]["text"];
    const drivers = await this.findDriverWhoAcceptRoute(distance);

    return { 
      origin: originGeocodeMaps,
      destination: destinationGeocodeMaps,
      distance: distance,
      duration: duration,
      options: drivers.map(e => {
        return {
          id: e.id,
          name: e.name,
          description: e.description,
          vehicle: e.vehicle,
          review: {
            rating: e.review_rating,
            comment: e.review_comment,
          },
          value: (e.tax * distance),
        };
      }),
      routeResponse: routeMaps,
    };
  }

  protected async findMatrixRouteGoogleMaps(origin: GeocodeResponse, 
                                            destination: GeocodeResponse,
                                            apiKey: string) {
    const apiURL = `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${destination.latitude},${destination.longitude}&origins=${origin.latitude},${origin.longitude}&units=imperial&key=${apiKey}`;
    const result = await axios.get(apiURL) as any;
    return result.data;
  }

  protected async findGeocodeMaps(address: string, apiKey: string) {
    const apiURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`;
    const result = await axios.get(apiURL) as any;
    const { lat, lng } = result.data["results"][0]["geometry"]["location"];
    return { latitude: lat, longitude: lng } as GeocodeResponse;
  }

  protected async findDriverWhoAcceptRoute(distance: number) {
    return await this.driverRepository.findWhoAcceptRoute(distance);
  }

  private isCustomerIdNonExists(request: RideEstimateRequest) {
    return !request.customer_id || typeof request.customer_id !== "string";
  }

  private isDestinationNonExists(request: RideEstimateRequest) {
    return !request.destination || typeof request.destination !== "string";
  }

  private isOriginNonExists(request: RideEstimateRequest) {
    return !request.origin || typeof request.origin !== "string";
  }

}

export { RideEstimateService };
