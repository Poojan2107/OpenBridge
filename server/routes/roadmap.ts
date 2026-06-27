import { Router } from "express";
import { z } from "zod";
import { Type } from "@google/genai";
import { prisma } from "../../src/db";
import { getGeminiClient, getFallbackRoadmap } from "../services/gemini";
import { saveUserRoadmap } from "../services/db";

const router = Router();

const RoadmapSchema = z.object({
  skills: z.array(z.string()).optional().default([]),
  level: z.string().optional().default("Beginner"),
  githubUser: z.any().nullable().optional(),
});

const ToggleSchema = z.object({
  login: z.string(),
  taskText: z.string(),
  isCompleted: z.boolean(),
});

// POST /api/roadmap
router.post("/api/roadmap", async (req, res) => {
  try {
    const parseResult = RoadmapSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res
        .status(400)
        .json({ error: "Invalid request payload format.", details: parseResult.error.format() });
    }

    const { skills, level, githubUser } = parseResult.data;
    const ai = getGeminiClient();
    let roadmapData: any = null;

    if (!ai) {
      console.log("Serving simulated roadmap...");
      roadmapData = getFallbackRoadmap(skills, level);
    } else {
      const promptMessage = `Act as an experienced open-source engineering coordinator. Generate a highly personalized and highly actionable 4-week roadmap to help a developer make their first contribution.
Skills: ${skills.join(", ") || "General Programming"}
Experience Level: ${level}

The output must consist of exactly 4 keys: "week1", "week2", "week3", and "week4". Each week should be an array of exactly 3 concise, extremely specific task sentences. 
Avoid generic advice. Tailor actions to git setup, community documentation review, repository cloning/testing, identifying a simple issue matching their skills, writing a minor pull request, and working with maintainers.

Always output response strictly in the following JSON format structure:
{
  "week1": ["task 1", "task 2", "task 3"],
  "week2": ["task 1", "task 2", "task 3"],
  "week3": ["task 1", "task 2", "task 3"],
  "week4": ["task 1", "task 2", "task 3"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptMessage,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["week1", "week2", "week3", "week4"],
            properties: {
              week1: { type: Type.ARRAY, items: { type: Type.STRING } },
              week2: { type: Type.ARRAY, items: { type: Type.STRING } },
              week3: { type: Type.ARRAY, items: { type: Type.STRING } },
              week4: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
        },
      });

      const text = response.text;
      if (text) {
        try {
          roadmapData = JSON.parse(text);
        } catch (jsonErr) {
          console.error("Failed to parse Gemini roadmap JSON. Text was:", text);
          roadmapData = getFallbackRoadmap(skills, level);
        }
      } else {
        roadmapData = getFallbackRoadmap(skills, level);
      }
    }

    // Save custom roadmap weeks and tasks in database if logged in
    if (githubUser && roadmapData) {
      await saveUserRoadmap(githubUser, roadmapData);
    }

    return res.json(roadmapData);
  } catch (err) {
    console.error("API /api/roadmap errored out. Falling back to mock data.", err);
    const { skills = [], level = "Beginner", githubUser = null } = req.body;
    const roadmapData = getFallbackRoadmap(skills, level);

    if (githubUser && roadmapData) {
      try {
        await saveUserRoadmap(githubUser, roadmapData);
      } catch (dbErr) {
        console.error("Failed to save roadmap in database fallback:", dbErr);
      }
    }

    return res.json(roadmapData);
  }
});

// POST /api/roadmap/task/toggle
router.post("/api/roadmap/task/toggle", async (req, res) => {
  try {
    const parseResult = ToggleSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res
        .status(400)
        .json({ error: "Invalid request payload format.", details: parseResult.error.format() });
    }

    const { login, taskText, isCompleted } = parseResult.data;

    const user = await prisma.user.findFirst({
      where: { githubLogin: login },
      include: {
        profile: { include: { roadmap: { include: { weeks: { include: { tasks: true } } } } } },
      },
    });

    if (!user || !user.profile || !user.profile.roadmap) {
      return res.status(404).json({ error: "User roadmap not found." });
    }

    let matchedTask = null;
    for (const w of user.profile.roadmap.weeks) {
      const t = w.tasks.find((task) => task.taskText === taskText);
      if (t) {
        matchedTask = t;
        break;
      }
    }

    if (!matchedTask) {
      return res.status(404).json({ error: "Task not found in roadmap." });
    }

    await prisma.roadmapTask.update({
      where: { id: matchedTask.id },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Failed to toggle roadmap task:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/roadmap/export/:login
router.get("/api/roadmap/export/:login", async (req, res) => {
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
                    tasks: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.profile) {
      return res.status(404).json({ error: "User profile not found." });
    }

    let parsedSkills: string[] = [];
    try {
      parsedSkills = JSON.parse(user.profile.skills);
    } catch {
      parsedSkills = [];
    }

    const name = user.name || user.githubLogin;
    const domain = user.profile.interest;
    const level = user.profile.level;
    const skillsList = parsedSkills.join(", ") || "General Programming";

    let markdown = `# OpenBridge Contribution Roadmap\n\n## Profile Summary\n- **GitHub Username:** @${user.githubLogin}\n- **Developer Name:** ${name}\n- **Area of Interest:** ${domain}\n- **Experience Level:** ${level}\n- **Primary Skills:** ${skillsList}\n\n---\n\n## 4-Week Action Plan\n`;

    if (user.profile.roadmap && user.profile.roadmap.weeks.length > 0) {
      const sortedWeeks = [...user.profile.roadmap.weeks].sort(
        (a, b) => a.weekNumber - b.weekNumber,
      );

      sortedWeeks.forEach((week) => {
        markdown += `\n### Week ${week.weekNumber}\n`;
        const sortedTasks = [...week.tasks];
        sortedTasks.forEach((task) => {
          const checkbox = task.isCompleted ? "[x]" : "[ ]";
          markdown += `- ${checkbox} ${task.taskText}\n`;
        });
      });
    } else {
      markdown += `\n*No active roadmap found. Please complete the profiling process on the dashboard to generate a custom 4-week roadmap.*\n`;
    }

    markdown += `\n---\n*Generated by OpenBridge on ${new Date().toLocaleDateString()}. Keep contributing to open source!*\n`;

    res.setHeader("Content-Disposition", `attachment; filename="${user.githubLogin}-roadmap.md"`);
    res.setHeader("Content-Type", "text/markdown");
    return res.send(markdown);
  } catch (err) {
    console.error("Failed to export roadmap:", err);
    return res.status(500).send("Internal server error");
  }
});

export default router;
