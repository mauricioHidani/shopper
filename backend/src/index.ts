import Fastify from "fastify";
import cors from "@fastify/cors";
import { routes } from "./routes/routes";

import "dotenv/config";

const app = Fastify({ logger: true });

const start = async () => {
  
  try {
    await app.register(cors, {
      origin: "*", // change cors origin in production
      methods: ["GET", "POST", "PATCH"],
      credentials: true,
    });
    
    await app.register(routes);

    await app.listen({ 
      port: Number(process.env.PORT), 
      host: process.env.HOST
    });

  } catch (error) {
    process.exit(1);
  }
};

start();
