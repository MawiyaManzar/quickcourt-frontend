import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import pino from "pino";
import { env } from "./config/env.js";
import { setupSwagger } from "./config/swagger.js";
import { errorHandler } from "./middleware/error.middleware.js";

// ── Import route modules ──────────────────────────────────
import authRoutes from "./modules/auth/auth.routes.js";

// ── Logger ────────────────────────────────────────────────
const logger = pino({
  transport:
    env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});

// ── Express app ───────────────────────────────────────────
const app = express();

// ── Global middleware ─────────────────────────────────────
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// ── Swagger ───────────────────────────────────────────────
setupSwagger(app);

// ── Health check ──────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════════════════════
// ROUTE MODULES
// ═══════════════════════════════════════════════════════════
// Add your new module routes here:
//   app.use("/api/your-module", yourModuleRoutes);
// ═══════════════════════════════════════════════════════════

app.use("/api/auth", authRoutes);

// ── Error handler (must be last) ──────────────────────────
app.use(errorHandler);

export { app, logger };
