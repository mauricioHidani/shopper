import { FastifyRequest, FastifyReply, errorCodes } from "fastify";
import { RideEstimateService } from "../services/rideEstimateService";

import { RideEstimateRequest } from "../models/requests/rideEstimateRequest";
import { RideConfirmRequest } from "src/models/requests/rideConfirmRequest";
import { RideConfirmService } from "src/services/rideConfirmService";
import { InvalidDataError } from "src/errors/invalidDataError";
import { NotFoundError } from "src/errors/notFoundError";
import { CustomerRidesService } from "src/services/customerRidesService";

class RideController {

  private rideEstimateService: RideEstimateService;
  private rideConfirmService: RideConfirmService; 
  private customerRideService: CustomerRidesService;

  constructor(rideEstimateService: RideEstimateService,
              rideConfirmService: RideConfirmService,
              customerRideService: CustomerRidesService) {
    this.rideEstimateService = rideEstimateService;
    this.rideConfirmService = rideConfirmService;
    this.customerRideService = customerRideService;
  }

  async rideEstimate(request: FastifyRequest, reply: FastifyReply) {
    const requestBody: RideEstimateRequest = request.body as RideEstimateRequest;

    try {
      const result = await this.rideEstimateService.execute(requestBody);
      reply.status(200).send(result);
    } catch (e) {
      if (e instanceof InvalidDataError) {
        reply.status(400).send({ error_code: e.name, error_description: e.message });
      }
    }
  }

  async rideConfirm(request: FastifyRequest, reply: FastifyReply) {
    const requestBody: RideConfirmRequest = request.body as RideConfirmRequest;

    try {
      const result = await this.rideConfirmService.execute(requestBody);
      reply.status(200).send({ success: result });
    } catch(e) {
      const { name, message } = e as Error;
      
      let statusCode: number = 500;
      if (e instanceof InvalidDataError) { statusCode = 400; }
      if (e instanceof InvalidDataError && name === "INVALID_DISTANCE") { statusCode = 406; }
      if (e instanceof NotFoundError) { statusCode = 404; }

      reply.status(statusCode).send({ error_code: name, error_description: message });
    }
  }

  async listCustomersRides(request: FastifyRequest<{ Params: { customer_id: number }, Querystring: { driver_id: number } }>, reply: FastifyReply) {
    const { customer_id } = request.params;
    const { driver_id } = request.query;
    
    try {
      const result = await this.customerRideService.execute(Number(customer_id), Number(driver_id));
      reply.status(200).send(result);

    } catch (e) {
      const { name, message } = e as Error;
      
      let statusCode: number = 500;
      if (e instanceof InvalidDataError) { statusCode = 400; }
      if (e instanceof NotFoundError) { statusCode = 404; }

      reply.status(statusCode).send({ error_code: name, error_description: message });
    }
  }

}

export { RideController };
