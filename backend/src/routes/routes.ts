import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply
} from "fastify";


import { PrismaClient } from "@prisma/client";

import { DriverRepository } from "src/repositories/driverRepository";
import { RideRepository } from "src/repositories/rideRepository";
import { RideEstimateService } from "../services/rideEstimateService";
import { RideConfirmService } from "src/services/rideConfirmService";
import { RideController } from "../controllers/rideController";
import { CustomerRidesService } from "src/services/customerRidesService";

export async function routes(fastify: FastifyInstance, options: FastifyPluginOptions) {

  const prismaClient = new PrismaClient();
  const driverRepository = new DriverRepository(prismaClient);
  const rideRepository = new RideRepository(prismaClient);
  const rideEstimateService = new RideEstimateService(driverRepository);
  const rideConfirmService = new RideConfirmService(driverRepository, rideRepository);
  const customerRideService = new CustomerRidesService(rideRepository, driverRepository);
  const rideController = new RideController(rideEstimateService, rideConfirmService, customerRideService);

  fastify.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    reply.status(200).send("shopper");
  });

  fastify.post("/ride/estimate", async (request: FastifyRequest, reply: FastifyReply) => {
    return await rideController.rideEstimate(request, reply);
  });

  fastify.patch("/ride/confirm", async (request: FastifyRequest, reply: FastifyReply) => {
    return await rideController.rideConfirm(request, reply);
  });

  fastify.get("/ride/:customer_id", 
    async (request: FastifyRequest<{ Params: { customer_id: number }, Querystring: { driver_id: number } }>, reply: FastifyReply) => {
      return await rideController.listCustomersRides(request, reply);
  });

}
