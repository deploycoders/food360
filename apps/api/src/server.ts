import bodyParser from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { ordersRouter } from "./routes/orders.routes";
import { swaggerSpec } from "./swagger";

const { json, urlencoded } = bodyParser;

export const createServer = (): Express => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors())
    .get("/status", (_, res) => res.json({ ok: true }))

    // UI de Documentación Swagger
    .use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

    // Rutas de la API
    .use("/api/v1/orders", ordersRouter);

  return app;
};
