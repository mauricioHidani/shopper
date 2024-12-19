import { InvalidDataError } from "src/errors/invalidDataError";
import { NotFoundError } from "src/errors/notFoundError";
import { RideConfirmRequest } from "src/models/requests/rideConfirmRequest";
import { DriverRepository } from "src/repositories/driverRepository";
import { RideRepository } from "src/repositories/rideRepository";

class RideConfirmService {

  private driverRepository: DriverRepository;
  private rideRepository: RideRepository;

  constructor(driverRepository: DriverRepository, rideRepository: RideRepository) {
    this.driverRepository = driverRepository;
    this.rideRepository = rideRepository;
  }
    
  async execute(request: RideConfirmRequest) {
    const isValidData = this.destinationOrOriginNonExists(request) && 
                        this.destinationAndOriginIsEquals(request) &&
                        this.isUserIdNonExists(request);
    if (isValidData) {
      throw new InvalidDataError("Os dados fornecidos no corpo da requisição são inválidos");
    }

    const driver = await this.driverRepository.findById(request.driver.id);
    if (!driver || driver.name !== request.driver.name) {
      throw new NotFoundError("Motorista não encontrado", "DRIVER_NOT_FOUND");
    }

    if (request.distance < driver.minimum_dist) {
      throw new InvalidDataError("Quilometragem inválida para o motorista", "INVALID_DISTANCE");
    }

    const result = this.rideRepository.create(request);
    return result !== null;
  }

  private destinationOrOriginNonExists(request: RideConfirmRequest) {
    return !request.destination || typeof request.destination !== "string" ||
           !request.origin || typeof request.origin !== "string";
  }

  private destinationAndOriginIsEquals(request: RideConfirmRequest) {
    return request.origin === request.destination;
  }

  private isUserIdNonExists(request: RideConfirmRequest) {
    return !request.customer_id || typeof request.customer_id !== "string";
  }

}

export { RideConfirmService };
