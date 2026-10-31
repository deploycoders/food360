import bodyParser from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import { dashboardRouter } from "./routes/dashboard.routes.js";
import { tablesRouter } from "./routes/tables.routes.js";
import { ordersRouter } from "./routes/orders.routes.js";
import { reservationsRouter } from "./routes/reservations.routes.js";
import { configurationRouter } from "./routes/configuration.routes.js";
import { productsRouter } from "./routes/products.routes.js";
import { profileRouter } from "./routes/profile.routes.js";
import { categoriesRouter } from "./routes/categories.routes.js";
import { teamRouter } from "./routes/team.routes.js";
import { teamInvitationAcceptRouter } from "./routes/team-invitations-public.routes.js";
import { onboardingRouter } from "./routes/onboarding.routes.js";
import { uploadsRouter } from "./routes/uploads.routes.js";
import { publicRestaurantsRouter } from "./routes/public-restaurants.routes.js";

import { swaggerSpec } from "./swagger.js";
import { verifyAuth } from "../auth.middleware.js";

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
    .use("/api/v1/dashboard", verifyAuth, dashboardRouter)
    .use("/api/v1/profile", verifyAuth, profileRouter)
    .use("/api/v1/uploads", verifyAuth, uploadsRouter)
    .use("/api/v1/onboarding", onboardingRouter)
    .use("/api/v1/public/restaurants", publicRestaurantsRouter)
    .use("/api/v1/team/invitations/accept", teamInvitationAcceptRouter)
    .use("/api/v1/team", verifyAuth, teamRouter);

  return app;
};

// Instancia que Vercel utilizará como entrada de Express.
const app = createServer();

export default app;
