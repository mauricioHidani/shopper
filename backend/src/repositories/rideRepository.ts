import { PrismaClient, Rides } from "@prisma/client";
import { RideConfirmRequest } from "src/models/requests/rideConfirmRequest";

class RideRepository {

  private prismaClient: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prismaClient = prismaClient;
  }

  async create(ride: RideConfirmRequest) {
    return await this.prismaClient.rides.create({
      data: {
        date: new Date().toISOString(),
        destination: ride.destination,
        distance: ride.distance,
        duration: ride.duration,
        value: ride.value,
        origin: ride.origin,
        customer_id: ride.customer_id,
        driver_id: ride.driver.id,
        driver_name: ride.driver.name
      }
    });
  }

  async findByCustomer(customer_id: number) {
    return await this.prismaClient.rides.findMany({
      where: {
        customer_id: customer_id
      }
    });
  }

  async findByCustomerAndDriver(customer_id: number, driver_id: number) {
    return await this.prismaClient.rides.findMany({
      where: {
        customer_id: customer_id,
        AND: {
          driver_id: driver_id
        }
      }
    });
  }
  
}

export { RideRepository };
