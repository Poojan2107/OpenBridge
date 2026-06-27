import { Router } from "express";
import { prisma } from "../../src/db";

const router = Router();

// GET /api/leaderboard
// Returns top 20 contributors ranked by tasks completed + PRs merged
router.get("/api/leaderboard", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: {
          include: {
            roadmap: {
              include: {
                weeks: {
                  include: { tasks: true },
                },
              },
            },
          },
        },
        pullRequests: true,
      },
    });

    const entries = users
      .filter((u) => u.profile) // only users with a profile
      .map((u) => {
        let completedTasks = 0;
        if (u.profile?.roadmap?.weeks) {
          u.profile.roadmap.weeks.forEach((w) => {
            w.tasks.forEach((t) => {
              if (t.isCompleted) completedTasks++;
            });
          });
        }

        const totalTasks = u.profile?.roadmap?.weeks
          ? u.profile.roadmap.weeks.reduce((acc, w) => acc + w.tasks.length, 0)
          : 0;

        const mergedPRs = u.pullRequests.filter((pr) => pr.status === "MERGED").length;
        const pendingPRs = u.pullRequests.filter(
          (pr) => pr.status === "PENDING" || pr.status === "VERIFYING",
        ).length;

        // XP formula: 50 per task + 200 per merged PR + 30 per pending PR
        const xp = completedTasks * 50 + mergedPRs * 200 + pendingPRs * 30;

        let skills: string[] = [];
        try {
          skills = u.profile?.skills ? JSON.parse(u.profile.skills) : [];
        } catch {
          skills = [];
        }

        return {
          login: u.githubLogin,
          name: u.name || u.githubLogin,
          avatarUrl: u.avatarUrl,
          level: u.profile?.level || "Beginner",
          interest: u.profile?.interest || "Frontend",
          skills: skills.slice(0, 4),
          xp,
          completedTasks,
          totalTasks,
          mergedPRs,
          pendingPRs,
        };
      })
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 20);

    return res.json({ entries });
  } catch (err) {
    console.error("Failed to fetch leaderboard:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/github/skills/:login
// Fetches the top languages from user's public GitHub repos
router.get("/api/github/skills/:login", async (req, res) => {
  try {
    const { login } = req.params;

    // Find the stored user to get their access token if available
    const user = await prisma.user.findFirst({
      where: { githubLogin: login },
    });

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "OpenBridge-App",
    };

    // Use stored access token if available for higher rate limits
    const token = user?.accessToken || process.env.GITHUB_TOKEN;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Fetch user repos
    const reposRes = await fetch(
      `https://api.github.com/users/${login}/repos?per_page=50&sort=updated&type=owner`,
      { headers },
    );

    if (!reposRes.ok) {
      return res.status(reposRes.status).json({
        error: "Could not fetch GitHub repositories.",
        skills: [],
      });
    }

    const repos = (await reposRes.json()) as Array<{
      name: string;
      language: string | null;
      fork: boolean;
      stargazers_count: number;
    }>;

    // Tally language frequencies from non-fork repos
    const langCount: Record<string, number> = {};
    repos
      .filter((r) => !r.fork && r.language)
      .forEach((r) => {
        const lang = r.language!;
        langCount[lang] = (langCount[lang] || 0) + 1 + r.stargazers_count * 0.1;
      });

    // Map GitHub language names to our preset skill labels
    const LANG_MAP: Record<string, string> = {
      TypeScript: "TypeScript",
      JavaScript: "JavaScript",
      Python: "Python",
      Go: "Go",
      Rust: "Rust",
      "C++": "C++",
      Java: "Java",
      CSS: "HTML/CSS",
      HTML: "HTML/CSS",
      Vue: "JavaScript",
      Ruby: "JavaScript",
      Dockerfile: "Docker",
      Shell: "DevOps / Infrastructure",
    };

    const detectedSkills = Object.entries(langCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([lang]) => LANG_MAP[lang] || lang)
      .filter((v, i, arr) => arr.indexOf(v) === i); // deduplicate

    // Always include Git/GitHub as a base skill
    if (!detectedSkills.includes("Git/GitHub")) {
      detectedSkills.push("Git/GitHub");
    }

    return res.json({ skills: detectedSkills, repoCount: repos.length });
  } catch (err) {
    console.error("Failed to detect skills from GitHub:", err);
    return res.status(500).json({ error: "Internal server error.", skills: [] });
  }
});

export default router;
