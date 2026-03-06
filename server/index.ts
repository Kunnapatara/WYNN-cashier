import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";

const app = express();
const httpServer = createServer(app);

// JSON + form parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// basic request logger
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    if (req.path.startsWith("/api")) {
      console.log(
        `${req.method} ${req.path} ${res.statusCode} ${duration}ms`
      );
    }
  });

  next();
});

async function startServer() {
  try {

    /**
     * IMPORTANT
     * Register API routes FIRST
     */
    await registerRoutes(httpServer, app);

    console.log("API routes registered");

    /**
     * Static / Vite must come AFTER API
     * or they override /api/*
     */
    if (process.env.NODE_ENV === "production") {

      serveStatic(app);

    } else {

      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);

    }

    /**
     * Global error handler
     */
    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {

      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error("SERVER ERROR:", err);

      if (res.headersSent) {
        return next(err);
      }

      res.status(status).json({ message });

    });

    /**
     * Start server
     */
    const port = parseInt(process.env.PORT || "5000", 10);

    httpServer.listen(port, () => {

      console.log(`🚀 WYNN server running`);
      console.log(`🌐 http://localhost:${port}`);

    });

  } catch (error) {

    console.error("Server boot failed:", error);
    process.exit(1);

  }
}

startServer();