import { Router, Request } from "express";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../src/db";
import { addSSEClient, removeSSEClient, broadcastSSEEvent } from "../services/sse";

const router = Router();

// Custom interface for requests with rawBody
interface SignedRequest extends Request {
  rawBody?: Buffer;
}

// GET /api/events — SSE endpoint for real-time notifications
router.get("/api/events", (req, res) => {
  const clientId = uuidv4();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  // Send a heartbeat to confirm connection
  res.write(`event: connected\ndata: {"clientId":"${clientId}"}\n\n`);

  addSSEClient(clientId, res);

  // Heartbeat every 25 seconds to prevent proxy timeouts
  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat\n\n`);
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeSSEClient(clientId);
  });
});


function verifySignature(payload: string, signature: string | undefined, secret: string): boolean {
  if (!signature) return false;
  try {
    const hmac = crypto.createHmac("sha256", secret);
    const digest = "sha256=" + hmac.update(payload).digest("hex");
    
    // Convert both to buffers and compare with timingSafeEqual to avoid timing attacks
    const sigBuffer = Buffer.from(signature);
    const digestBuffer = Buffer.from(digest);
    
    if (sigBuffer.length !== digestBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(sigBuffer, digestBuffer);
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

router.post("/api/webhooks/github", async (req: SignedRequest, res) => {
  try {
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || "";
    // 1. Signature validation (Optional but recommended in production)
    if (webhookSecret) {
      const signature = req.headers["x-hub-signature-256"] as string;
      const rawBody = req.rawBody?.toString("utf8") || JSON.stringify(req.body);
      
      if (!verifySignature(rawBody, signature, webhookSecret)) {
        console.warn("Invalid GitHub Webhook Signature.");
        return res.status(401).json({ error: "Invalid signature verification." });
      }
    }

    const event = req.headers["x-github-event"];
    if (event !== "pull_request") {
      // We only process pull request events
      return res.status(200).json({ status: "ignored", message: `Event ${event} ignored.` });
    }

    const payload = req.body;
    const { action, pull_request, repository } = payload;

    if (!pull_request || !repository) {
      return res.status(400).json({ error: "Invalid webhook payload." });
    }

    const prNumber = pull_request.number;
    const repoFullName = repository.full_name;
    const githubLogin = pull_request.user?.login;
    const title = pull_request.title || "";
    const prUrl = pull_request.html_url || "";
    const isMerged = pull_request.merged === true;
    const isClosed = pull_request.state === "closed";

    // Determine status
    let status = "PENDING";
    if (isMerged) {
      status = "MERGED";
    } else if (isClosed) {
      status = "FAILED";
    } else {
      status = "PENDING";
    }

    // Find the contributor user
    const user = await prisma.user.findFirst({
      where: { githubLogin }
    });

    if (!user) {
      console.warn(`User with login '${githubLogin}' not found in database for PR #${prNumber}.`);
      return res.status(200).json({ status: "skipped", message: "User not registered in OpenBridge." });
    }

    // Upsert the PullRequest
    const existingPr = await prisma.pullRequest.findFirst({
      where: {
        userId: user.id,
        prNumber,
        repoFullName
      }
    });

    let pr;
    if (existingPr) {
      pr = await prisma.pullRequest.update({
        where: { id: existingPr.id },
        data: {
          status,
          title,
          url: prUrl
        }
      });
      console.log(`Updated PullRequest #${prNumber} for ${githubLogin} to status: ${status}`);
    } else {
      pr = await prisma.pullRequest.create({
        data: {
          userId: user.id,
          prNumber,
          repoFullName,
          title,
          url: prUrl,
          status
        }
      });
      console.log(`Registered new PullRequest #${prNumber} for ${githubLogin} with status: ${status}`);
    }

    // Broadcast real-time SSE notification to all connected clients
    broadcastSSEEvent({
      type: "PR_UPDATE",
      payload: {
        login: githubLogin,
        prNumber,
        repoFullName,
        title,
        status,
        prUrl,
        timestamp: new Date().toISOString(),
      },
    });

    return res.status(200).json({ success: true, pullRequest: pr });
  } catch (err: any) {
    console.error("Error processing GitHub Webhook:", err);
    return res.status(500).json({ error: "Failed to process webhook." });
  }
});

export default router;
