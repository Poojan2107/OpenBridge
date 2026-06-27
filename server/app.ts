import express from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";

import authRouter from "./routes/auth";
import recommendRouter from "./routes/recommend";
import roadmapRouter from "./routes/roadmap";
import explainRouter from "./routes/explain";
import codereviewRouter from "./routes/codereview";
import interviewRouter from "./routes/interview";
import userRouter from "./routes/user";
import webhooksRouter from "./routes/webhooks";
import leaderboardRouter from "./routes/leaderboard";
import { rateLimiter } from "./middleware/rateLimiter";

const app = express();

app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use("/api/recommend", rateLimiter);
app.use("/api/explain", rateLimiter);
app.use("/api/codereview", rateLimiter);
app.use("/api/interview", rateLimiter);

app.use(authRouter);
app.use(recommendRouter);
app.use(roadmapRouter);
app.use(explainRouter);
app.use(codereviewRouter);
app.use(interviewRouter);
app.use(userRouter);
app.use(webhooksRouter);
app.use(leaderboardRouter);

export { app };
