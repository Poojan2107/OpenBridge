import express from "express";
import path from "path";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import { createServer as createViteServer } from "vite";

// Route modules
import authRouter from "./server/routes/auth";
import recommendRouter from "./server/routes/recommend";
import roadmapRouter from "./server/routes/roadmap";
import explainRouter from "./server/routes/explain";
import codereviewRouter from "./server/routes/codereview";
import interviewRouter from "./server/routes/interview";
import userRouter from "./server/routes/user";
import webhooksRouter from "./server/routes/webhooks";

// Rate Limiter middleware
import { rateLimiter } from "./server/middleware/rateLimiter";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

// Security middleware configuration
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: process.env.APP_URL || "http://localhost:3000",
  credentials: true,
}));

// Apply Rate Limiters
app.use("/api/recommend", rateLimiter);
app.use("/api/explain", rateLimiter);
app.use("/api/codereview", rateLimiter);
app.use("/api/interview", rateLimiter);

// Register Router Modules
app.use(authRouter);
app.use(recommendRouter);
app.use(roadmapRouter);
app.use(explainRouter);
app.use(codereviewRouter);
app.use(interviewRouter);
app.use(userRouter);
app.use(webhooksRouter);

// Vite middleware integration / Static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export { app };
