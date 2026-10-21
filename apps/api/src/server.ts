import bodyParser from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { dashboardRouter } from "./routes/dashboard.routes";
import { tablesRouter } from "./routes/tables.routes";
import { ordersRouter } from "./routes/orders.routes";
import { reservationsRouter } from "./routes/reservations.routes";
import { configurationRouter } from "./routes/configuration.routes";
import { productsRouter } from "./routes/products.routes";
import { categoriesRouter } from "./routes/categories.routes";
import { swaggerSpec } from "./swagger";
import { verifyAuth } from "../middleware";

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
    .use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
    .use("/api/v1/orders", verifyAuth, ordersRouter)
    .use("/api/v1/tables", verifyAuth, tablesRouter)
    .use("/api/v1/reservations", verifyAuth, reservationsRouter)
    .use("/api/v1/configuration", verifyAuth, configurationRouter)
    .use("/api/v1/products", verifyAuth, productsRouter)
    .use("/api/v1/categories", verifyAuth, categoriesRouter)
    .use("/api/v1/dashboard", verifyAuth, dashboardRouter);

  return app;
};
