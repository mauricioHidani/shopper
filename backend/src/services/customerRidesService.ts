import { PrismaClient, Rides } from "@prisma/client";
import { InvalidDataError } from "src/errors/invalidDataError";
import { NotFoundError } from "src/errors/notFoundError";
import { DriverRepository } from "src/repositories/driverRepository";
import { RideRepository } from "src/repositories/rideRepository";

class CustomerRidesService {

  private rideRepository: RideRepository;
  private driverRepository: DriverRepository;

  constructor(rideRepository: RideRepository, driverRepository: DriverRepository) {
    this.rideRepository = rideRepository;
    this.driverRepository = driverRepository;
  }

  async execute(customer_id: number, driver_id: number) {
    let ridesResult: Array<Rides>;

    if (this.customerIdNonExists(customer_id)) {
      throw new InvalidDataError("Cliente informado é inválido.", "CUSTOMER_INVALID_DATA");
    }
    
    if (driver_id && this.driverIdIsValid(driver_id)) {
      const driver = await this.driverRepository.findById(driver_id);
      if (!driver) {
        throw new InvalidDataError("Motorista invalido", "INVALID_DRIVER");
      }

      ridesResult = await this.rideRepository.findByCustomerAndDriver(customer_id, driver.id);
      
    } else {
      ridesResult = await this.rideRepository.findByCustomer(customer_id);
    }

    if (!ridesResult) {
      throw new NotFoundError("Nenhum registro encontrado", "NO_RIDES_FOUND");
    }

    return {
      customer_id: customer_id,
      rides: ridesResult.map(e => {
        return {
          id: e.id,
          date: e.date,
          origin: e.origin,
          destination: e.destination,
          distance: e.distance,
          duration: e.duration,
          driver: {
            id: e.driver_id,
            name: e.driver_name
          },
          value: e.value
        }
      })
    };
  }

  private customerIdNonExists(customer_id: number) {
    return !customer_id || typeof customer_id !== "number"; 
  }

  private driverIdIsValid(driver_id: number) {
    return typeof driver_id === "number";
  }
}

export { CustomerRidesService };
