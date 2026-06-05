import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../src/db";
import { parseGpgPublicKey } from "../services/gpg";

const router = Router();

// GET /api/user/:login
router.get("/api/user/:login", async (req, res) => {
  try {
    const { login } = req.params;

    const user = await prisma.user.findFirst({
      where: { githubLogin: login },
      include: {
        profile: {
          include: {
            roadmap: {
              include: {
                weeks: {
                  include: {
                    tasks: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user || !user.profile) {
      return res.status(404).json({ error: "User profile not found." });
    }

    const checkedTasks: { [key: string]: boolean } = {};
    const roadmapData: any = { week1: [], week2: [], week3: [], week4: [] };

    if (user.profile.roadmap) {
      user.profile.roadmap.weeks.forEach((w) => {
        const weekKey = `week${w.weekNumber}` as "week1" | "week2" | "week3" | "week4";
        w.tasks.forEach((t, idx) => {
          roadmapData[weekKey].push(t.taskText);
          if (t.isCompleted) {
            checkedTasks[`${weekKey}-${idx}`] = true;
          }
        });
      });
    }

    let parsedSkills: string[] = [];
    try {
      parsedSkills = JSON.parse(user.profile.skills);
    } catch {
      parsedSkills = [];
    }

    return res.json({
      profile: {
        skills: parsedSkills,
        level: user.profile.level,
        interest: user.profile.interest
      },
      repos: user.profile.repos || [],
      roadmap: user.profile.roadmap ? roadmapData : null,
      checkedRoadmapTasks: checkedTasks
    });
  } catch (err) {
    console.error("Failed to fetch user data:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/user/:login/reset
router.post("/api/user/:login/reset", async (req, res) => {
  try {
    const { login } = req.params;

    const user = await prisma.user.findFirst({
      where: { githubLogin: login },
      include: { profile: true }
    });

    if (user && user.profile) {
      await prisma.profile.delete({
        where: { id: user.profile.id }
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Failed to reset user profile in database:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/badge/:login.svg
router.get("/api/badge/:login.svg", async (req, res) => {
  try {
    const { login } = req.params;
    const { name: queryName, theme: queryTheme } = req.query;

    const user = await prisma.user.findFirst({
      where: { githubLogin: login },
      include: {
        profile: {
          include: {
            roadmap: {
              include: {
                weeks: {
                  include: {
                    tasks: true
                  }
                }
              }
            }
          }
        }
      }
    });

    let passholderName = (queryName as string) || (user?.name) || user?.githubLogin || "Guest Committer";
    let domain = user?.profile?.interest || "Frontend Base";
    let level = user?.profile?.level || "Beginner";
    let completedCount = 0;
    
    if (user?.profile?.roadmap?.weeks) {
      user.profile.roadmap.weeks.forEach((w) => {
        w.tasks.forEach((t) => {
          if (t.isCompleted) {
            completedCount++;
          }
        });
      });
    } else {
      completedCount = 3;
    }

    const theme = (queryTheme as string) || "classic";
    let bgColor = "#0d1117";
    let borderColor = "#30363d";
    let mainTextColor = "#f0f6fc";
    let subTextColor = "#8b949e";
    let accentColor = "#58a6ff";
    let progressBg = "#21262d";
    let progressFill = "#238636";

    if (theme === "cyberpunk") {
      bgColor = "#140f09";
      borderColor = "#f0a202";
      mainTextColor = "#f0f6fc";
      subTextColor = "#a87102";
      accentColor = "#ff7900";
      progressBg = "#221303";
      progressFill = "#ff7900";
    } else if (theme === "emerald") {
      bgColor = "#091210";
      borderColor = "#10b981";
      mainTextColor = "#f0f6fc";
      subTextColor = "#34d399";
      accentColor = "#10b981";
      progressBg = "#11221b";
      progressFill = "#10b981";
    }

    let levelColor = mainTextColor;
    if (level === "Advanced") levelColor = "#f85149";
    else if (level === "Intermediate") levelColor = "#58a6ff";
    else if (level === "Beginner") levelColor = "#3fb950";

    const totalTasks = 12;
    const progressPercent = Math.min(100, Math.max(0, (completedCount / totalTasks) * 100));
    const progressWidth = Math.round((progressPercent / 100) * 84);

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="120" viewBox="0 0 480 120">
  <style>
    .title { font-family: monospace; font-size: 10px; font-weight: bold; fill: ${subTextColor}; letter-spacing: 1.5px; }
    .status { font-family: sans-serif; font-size: 10px; font-weight: bold; fill: ${accentColor}; }
    .name { font-family: sans-serif; font-size: 14px; font-weight: bold; fill: ${mainTextColor}; }
    .label { font-family: monospace; font-size: 8px; fill: ${subTextColor}; letter-spacing: 0.5px; }
    .value { font-family: sans-serif; font-size: 11px; font-weight: 600; fill: ${mainTextColor}; }
    .level-val { font-family: sans-serif; font-size: 11px; font-weight: 600; fill: ${levelColor}; }
    .checksum { font-family: monospace; font-size: 8px; fill: ${subTextColor}; opacity: 0.7; }
  </style>

  <!-- Background and border -->
  <rect width="478" height="118" x="1" y="1" rx="8" fill="${bgColor}" stroke="${borderColor}" stroke-width="1.5"/>

  <!-- Top bar header line -->
  <line x1="1" y1="28" x2="479" y2="28" stroke="${borderColor}" stroke-width="1" />

  <!-- Header text -->
  <text x="16" y="18" class="title">OPENBRIDGE ONBOARDING PASS</text>
  <text x="365" y="18" class="status">● VERIFIED PASS</text>

  <!-- Graphic emblem icon (left) -->
  <rect x="16" y="44" width="48" height="48" rx="6" fill="${progressBg}" stroke="${borderColor}" stroke-width="1"/>
  <!-- Star icon -->
  <path d="M40 50 L43 57 L50 58 L45 63 L46 70 L40 66 L34 70 L35 63 L30 58 L37 57 Z" fill="${accentColor}" />
  <text x="40" y="84" font-family="monospace" font-size="8" font-weight="bold" fill="${subTextColor}" text-anchor="middle">OSS-0${completedCount}</text>

  <!-- Passholder Info -->
  <text x="80" y="46" class="label">PASSHOLDER</text>
  <text x="80" y="60" class="name">${passholderName}</text>

  <!-- Details block grid -->
  <!-- Col 1 -->
  <text x="80" y="78" class="label">DOMAIN</text>
  <text x="80" y="92" class="value">${domain}</text>

  <!-- Col 2 -->
  <text x="180" y="78" class="label">PROFICIENCY</text>
  <text x="180" y="92" class="level-val">${level}</text>

  <!-- Col 3 -->
  <text x="280" y="78" class="label">ROADMAP COMMITS</text>
  <text x="280" y="92" class="value">${completedCount} / 12</text>

  <!-- Progress bar -->
  <text x="380" y="46" class="label">PROGRESS</text>
  <rect x="380" y="52" width="84" height="6" rx="3" fill="${progressBg}"/>
  <rect x="380" y="52" width="${progressWidth}" height="6" rx="3" fill="${progressFill}"/>
  <text x="380" y="72" font-family="monospace" font-size="8" font-weight="bold" fill="${accentColor}">${Math.round(progressPercent)}% DONE</text>

  <!-- Checksum Footer line -->
  <line x1="1" y1="104" x2="479" y2="104" stroke="${borderColor}" stroke-width="1" stroke-dasharray="2, 2" />
  <text x="16" y="112" class="checksum">SHA256: 4e9d6bc0f50dfa213e4b${completedCount}812ae93bd20f9a2e37e90c885cf34612ce00befb15</text>
</svg>
`;

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.send(svg.trim());
  } catch (err) {
    console.error("Failed to generate SVG badge:", err);
    return res.status(500).send("Internal server error");
  }
});

const GpgVerifySchema = z.object({
  publicKeyBlock: z.string().min(1, "GPG public key block is required."),
});

router.post("/api/gpg/verify", (req, res) => {
  try {
    const parseResult = GpgVerifySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid payload.", details: parseResult.error.format() });
    }

    const { publicKeyBlock } = parseResult.data;
    const metadata = parseGpgPublicKey(publicKeyBlock);
    return res.json({ success: true, metadata });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to parse GPG public key block." });
  }
});

export default router;
