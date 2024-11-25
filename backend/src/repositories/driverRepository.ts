import { PrismaClient } from "@prisma/client";

class DriverRepository {

  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findById(driverId: number) {
    return await this.prisma.drivers.findUnique({
      where: {
        id: driverId,
      },
    });
  }

  async findWhoAcceptRoute(kilometer: number) {
    return await this.prisma.drivers.findMany({
      where: {
        minimum_dist: {
          lte: kilometer,
        },
      },
      orderBy: {
        tax: 'asc',
      },
    });
  }
  
}

export { DriverRepository };
