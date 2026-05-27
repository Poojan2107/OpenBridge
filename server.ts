import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { prisma } from "./src/db";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client to prevent startup crash if GEMINI_API_KEY is not configured yet
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
        console.log("Successfully initialized GoogleGenAI client with key from environment.");
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI client:", err);
      }
    } else {
      console.warn("No valid GEMINI_API_KEY environment variable found. Falling back to structured local simulation.");
    }
  }
  return aiClient;
}

// Fallback generator for Repo recommendations based on inputs
function getFallbackRecommendations(skills: string[], level: string, interest: string) {
  const normalizedLevel = level.toLowerCase();
  const normalizedInterest = interest.toLowerCase();

  // Choose appropriate repos based on Area of Interest
  if (normalizedInterest.includes("frontend") || skills.some(s => ["react", "vue", "angular", "css", "html", "javascript", "typescript"].includes(s.toLowerCase()))) {
    return {
      repos: [
        {
          name: "github/docs",
          description: "The official open-source documentation for GitHub. Excellent first-contribution targets.",
          match: normalizedLevel === "beginner" ? "98%" : "85%",
          difficulty: "Beginner",
          issues: [
            "Fix inconsistent spacing in Markdown table guides",
            "Update quickstart document for Codespaces setup flow",
            "Translate standard onboarding prerequisites into simplified tutorial steps"
          ]
        },
        {
          name: "vitejs/vite",
          description: "Next-generation frontend tooling. Very active community and friendly maintainers.",
          match: normalizedLevel === "intermediate" ? "92%" : "82%",
          difficulty: "Intermediate",
          issues: [
            "Add detailed warning logs in dev server when port 3000 is occupied",
            "Improve performance of CSS compilation caches on large directories",
            "Refactor index page serving logic to support fallback paths more gracefully"
          ]
        },
        {
          name: "lucide-react/lucide",
          description: "Beautiful & consistent icon toolkit made by the community. Excellent for standard icon fixes or design contributions.",
          match: "89%",
          difficulty: "Beginner",
          issues: [
            "Add responsive aria-label helpers to React wrappers",
            "Fix stroke alignment on custom terminal dashboard icon",
            "Refactor package export list in package.json to avoid bundler conflicts"
          ]
        }
      ]
    };
  } else if (normalizedInterest.includes("backend") || skills.some(s => ["node", "express", "python", "django", "java", "sql", "db"].includes(s.toLowerCase()))) {
    return {
      repos: [
        {
          name: "expressjs/express",
          description: "Fast, unopinionated, minimalist web framework for Node.js. The foundation of modern fullstack apps.",
          match: normalizedLevel === "beginner" ? "90%" : "85%",
          difficulty: "Beginner",
          issues: [
            "Improve validation of malformed JSON payloads in body-parser components",
            "Correct docstring annotations for res.cookie setting options",
            "Create comprehensive documentation detailing custom middleware execution order"
          ]
        },
        {
          name: "fastapi/fastapi",
          description: "Modern, fast (high-performance), web framework for building APIs with Python based on standard Python type hints.",
          match: normalizedLevel === "intermediate" ? "94%" : "86%",
          difficulty: "Intermediate",
          issues: [
            "Optimize dependency injection performance to support fast async routes",
            "Resolve edge case validation errors when parsing complex nested Pydantic parameters",
            "Acknowledge and implement user examples inside automatic Swagger documentation generation"
          ]
        },
        {
          name: "node-postgres/node-postgres",
          description: "Collection of Node.js modules for interfacing with PostgreSQL databases. Solid foundational backend tech.",
          match: "85%",
          difficulty: "Intermediate",
          issues: [
            "Fix connection timeout leaks when transaction throws uncaught database exception",
            "Add simplified example documenting connection pool patterns under serverless environments",
            "Incorporate auto-reconnect fallback parameters when TCP connection breaks"
          ]
        }
      ]
    };
  } else if (normalizedInterest.includes("ai") || normalizedInterest.includes("data") || skills.some(s => ["python", "pytorch", "ml", "ai", "pandas", "numpy"].includes(s.toLowerCase()))) {
    return {
      repos: [
        {
          name: "langchain-ai/langchain",
          description: "Building applications with LLMs through composability. Extremely fast-moving open-source ecosystem.",
          match: normalizedLevel === "intermediate" ? "95%" : "80%",
          difficulty: "Intermediate",
          issues: [
            "Fix parsing errors inside JSON agents with incomplete markdown boundaries",
            "Update quickstart notebook guides for Google Gemini models integration",
            "Add automatic retries for HTTP calls on token rate limiting"
          ]
        },
        {
          name: "python-pillow/Pillow",
          description: "The friendly PIL fork is an image processing library for Python. Ideal for learners with clear specs.",
          match: "88%",
          difficulty: "Beginner",
          issues: [
            "Fix type signatures in ImageDraw utility files",
            "Incorporate sample image resizing scripts with better performance margins",
            "Document EXIF metadata tags extraction using new simplified APIs"
          ]
        },
        {
          name: "huggingface/transformers",
          description: "State-of-the-art Machine Learning for PyTorch, TensorFlow, and JAX. Highly regarded source repository.",
          match: "84%",
          difficulty: "Intermediate",
          issues: [
            "Update onboarding environment guidelines to use clean virtual environments",
            "Correct parameter spelling in pipeline setup logs",
            "Optimize CPU fallback paths when CUDA accelerators are not available"
          ]
        }
      ]
    };
  } else {
    // Default fallback (DevOps or General)
    return {
      repos: [
        {
          name: "docker/cli",
          description: "The official command line interface for Docker. Perfect for developers interested in virtualization and shell scripts.",
          match: "85%",
          difficulty: "Intermediate",
          issues: [
            "Fix typo in flag helper messages for docker buildx run",
            "Add developer setup instructions for Windows Subsystem for Linux (WSL)",
            "Standardize logging output style for connection failures"
          ]
        },
        {
          name: "ansible/ansible",
          description: "Radically simple IT automation system. Excellent for learning configuration-as-code and infrastructure automation.",
          match: "82%",
          difficulty: "Intermediate",
          issues: [
            "Document edge cases where system path variables are overridden in SSH sessions",
            "Add integration tests for custom remote file replication handlers",
            "Refactor sample playbook variables to align with modern best practices"
          ]
        },
        {
          name: "ohmyzsh/ohmyzsh",
          description: "A delightful community-driven framework for managing your zsh configuration. Fun first contribution opportunity.",
          match: "95%",
          difficulty: "Beginner",
          issues: [
            "Fix aliases conflict when git plug-in is run alongside custom command trackers",
            "Update terminal indicator color in dark theme profiles to support high contrast accessibility",
            "Write standard walkthrough on adding custom widgets to ZSH shell status row"
          ]
        }
      ]
    };
  }
}

// Fallback roadmap based on inputs
function getFallbackRoadmap(skills: string[], level: string) {
  const levelText = level || "Beginner";
  const skillList = skills.length > 0 ? skills.join(", ") : "general-purpose program design";

  return {
    week1: [
      `Learn core Git workflow basics: fork OpenBridge repository, execute local clones, configure push branch origins.`,
      `Establish the target project's build setup on your machine. Install specific developer prerequisites configured inside package manifests.`,
      `Learn and configure lint rules or IDE styles matching the repository design guidelines.`
    ],
    week2: [
      `Review existing Documentation pages or Markdown guides and find minor errors and discrepancies.`,
      `Read and understand the specific contribution boundaries outlined inside CONTRIBUTING.md.`,
      `Execute standard validation tests to ensure your starting branch builds error-free.`
    ],
    week3: [
      `Identify and analyze simple issues with label "good first issue" or "help wanted" that leverage ${skillList}.`,
      `Identify core files using our Issue Translator to trace execution path inside codebase.`,
      `Implement local isolated updates to fix the chosen issue.`
    ],
    week4: [
      `Submit your very first Pull Request (PR) with simple, descriptive commit lines in clean detail.`,
      `Submit localized testing scripts or screenshots explaining the impact of your updates clearly.`,
      `Engage constructively with maintainers when review revisions are requested.`
    ]
  };
}

// Fallback explanation
function getFallbackExplanation(issueText: string) {
  // Try to find keywords in issue text to adapt explanation slightly
  const hasGit = /git|commit|push|github/gi.test(issueText);
  const hasDocker = /docker|container|compose/gi.test(issueText);
  const hasCss = /css|style|tailwind|color/gi.test(issueText);

  if (hasGit) {
    return {
      meaning: "This issue focuses on correcting or updating the project deployment/setup pipeline or code version trackers. Users are facing issues initializing git repositories or submitting correct commits without breaking upstream rules.",
      files: [
        ".github/workflows/deploy.yml",
        ".gitignore",
        "README.md"
      ],
      steps: [
        "Verify your local git system is pointing to correct parent origin.",
        "Update the ignored lines within file records to include standard temporary folders.",
        "Commit package updates cleanly and run validation scripts locally first."
      ]
    };
  } else if (hasDocker) {
    return {
      meaning: "The repository requires fixing the docker image definition or container settings. A dependency package version is likely outdated or fails to download inside the sandboxed running environment.",
      files: [
        "Dockerfile",
        "docker-compose.yml",
        "package.json"
      ],
      steps: [
        "Update the builder image version to use a stable node-Alpine container base.",
        "Expose correct internal ingress routing port inside custom Docker files.",
        "Launch container locally using docker-compose build to check for error exit codes."
      ]
    };
  } else if (hasCss) {
    return {
      meaning: "This is a styling bug in the application where responsive layouts are overlapping or failing contrast criteria on specific screens. It requires fixing broken tailwind layout classes or raw style metrics.",
      files: [
        "src/components/Dashboard.tsx",
        "src/index.css",
        "tailwind.config.js"
      ],
      steps: [
        "Inspect elements in the devtool frames to find overlapping constraints.",
        "Incorporate responsive Tailwind prefixes (sm:, md:) to wrap sidebars or grid cards cleanly on narrower screens.",
        "Correct background utility highlights to preserve high contrast accessibility limits."
      ]
    };
  } else {
    return {
      meaning: "This issue reports a functional error or warning during application boot or compilation. The current parameters are throwing unexpected exceptions under clean local test environments.",
      files: [
        "src/App.tsx",
        "src/utils/helpers.ts"
      ],
      steps: [
        "Run the clean setup tasks to purge outdated module caches from your root directories.",
        "Add visual safeguard conditions (like optional chaining) inside properties lookup code to prevent app crashes when values are undefined.",
        "Run mock test suites locally to ensure no broken dependencies are present."
      ]
    };
  }
}

function parseCookies(cookieHeader: string | undefined): { [key: string]: string } {
  const list: { [key: string]: string } = {};
  if (!cookieHeader) return list;
  cookieHeader.split(";").forEach(cookie => {
    const parts = cookie.split("=");
    const name = parts.shift()?.trim() || "";
    const value = decodeURIComponent(parts.join("="));
    if (name) list[name] = value;
  });
  return list;
}

async function getLiveGitHubRecommendations(skills: string[], level: string, interest: string) {
  try {
    const searchTerms: string[] = [];
    if (interest.toLowerCase().includes("frontend")) {
      searchTerms.push("topic:frontend");
    } else if (interest.toLowerCase().includes("backend")) {
      searchTerms.push("topic:backend");
    } else if (interest.toLowerCase().includes("ml") || interest.toLowerCase().includes("ai")) {
      searchTerms.push("topic:machine-learning");
    } else if (interest.toLowerCase().includes("devops")) {
      searchTerms.push("topic:devops");
    }

    skills.slice(0, 2).forEach(s => {
      const term = s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (term) searchTerms.push(term);
    });

    if (searchTerms.length === 0) {
      searchTerms.push("good-first-issues");
    }

    const query = searchTerms.join(" ");
    const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+good-first-issues:>0+is:public&sort=stars&order=desc&per_page=3`;
    
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "openbridge-mentor-app"
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub search API returned status: ${response.status}`);
    }

    const data: any = await response.json();
    const items = data.items || [];

    if (items.length === 0) {
      return getFallbackRecommendations(skills, level, interest);
    }

    const repos = await Promise.all(
      items.map(async (item: any) => {
        let issuesList: string[] = [];
        try {
          const issuesUrl = `https://api.github.com/search/issues?q=repo:${item.full_name}+is:issue+is:open+label:"good first issue"&per_page=3`;
          const issuesResponse = await fetch(issuesUrl, {
            headers: {
              "User-Agent": "openbridge-mentor-app"
            }
          });
          if (issuesResponse.ok) {
            const issuesData: any = await issuesResponse.json();
            issuesList = (issuesData.items || []).map((issue: any) => issue.title);
          }
        } catch (issueErr) {
          console.error(`Failed to fetch issues for ${item.full_name}:`, issueErr);
        }

        if (issuesList.length < 3) {
          const defaultIssues = [
            `Fix typo in README documentation coordinates`,
            `Update build dependency scripts to resolve compilation warnings`,
            `Add isolated unit tests for core module functions`
          ];
          issuesList = [...issuesList, ...defaultIssues].slice(0, 3);
        }

        const baseMatch = level.toLowerCase() === "beginner" ? 95 : 88;
        const randomModifier = Math.floor(Math.random() * 5);
        const matchPercent = `${baseMatch + randomModifier}%`;

        return {
          name: item.full_name,
          description: item.description ? (item.description.slice(0, 80) + (item.description.length > 80 ? "..." : "")) : "No description provided.",
          match: matchPercent,
          difficulty: level,
          issues: issuesList
        };
      })
    );

    return { repos };
  } catch (err) {
    console.error("Live GitHub API recommendations failed. Using local fallback.", err);
    return getFallbackRecommendations(skills, level, interest);
  }
}

// API Endpoints
app.post("/api/recommend", async (req, res) => {
  try {
    const { skills = [], level = "Beginner", interest = "Frontend", githubUser = null } = req.body;
    const ai = getGeminiClient();
    let recommendations: any = null;

    if (!ai) {
      console.log("Serving live repo recommendations...");
      recommendations = await getLiveGitHubRecommendations(skills, level, interest);
    } else {
      let githubContext = "";
      if (githubUser) {
        githubContext = `
The developer has logged in via GitHub:
- Username: @${githubUser.login}
- Name: ${githubUser.name || githubUser.login}
- GitHub Bio: "${githubUser.bio || "No bio specified."}"
- Public Repositories: ${githubUser.public_repos || 0}
- Followers: ${githubUser.followers || 0}

Please analyze this developer's profile. Suggest projects that directly appeal to interests implied in their bio or names. For example, if they have specialized skills, align your matches to those. If they are beginner or guest-committer, suggest great starting sandboxes like introductory web tools, popular templates, or robust library components.
`;
      }

      const promptMessage = `Act as an elite open-source engineering mentor. Recommend 3 suitable, highly specific, realistic open-source repositories hosted on GitHub for a developer with the following profile:${githubContext}
Skills: ${skills.join(", ") || "General Programming"}
Experience Level: ${level}
Area of Interest: ${interest}

For each repository, include the full name (e.g., "facebook/react" or suitable matching realistic real-world or common open source repositories), a brief description under 30 words, a simulated but realistic match percentage (e.g., "94%"), the difficulty category ("Beginner" or "Intermediate"), and exactly 3 very specific, highly realistic beginner-friendly issue examples they can solve, written in a clear action-oriented way.

Always output response strictly in the following JSON format structure:
{
  "repos": [
    {
      "name": "owner/repo-name",
      "description": "brief description of project",
      "match": "XX%",
      "difficulty": "Beginner/Intermediate",
      "issues": [
        "Issue action step 1",
        "Issue action step 2",
        "Issue action step 3"
      ]
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptMessage,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["repos"],
            properties: {
              repos: {
                type: Type.ARRAY,
                description: "The list of 3 repository suggestions.",
                items: {
                  type: Type.OBJECT,
                  required: ["name", "description", "match", "difficulty", "issues"],
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    match: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                    issues: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        }
      });

      const text = response.text;
      if (text) {
        try {
          recommendations = JSON.parse(text);
        } catch (jsonErr) {
          console.error("Failed to parse Gemini recommendations JSON. Text was:", text);
          recommendations = await getLiveGitHubRecommendations(skills, level, interest);
        }
      } else {
        recommendations = await getLiveGitHubRecommendations(skills, level, interest);
      }
    }

    // Save user profile state in database if logged in
    if (githubUser && recommendations && recommendations.repos) {
      try {
        const user = await prisma.user.upsert({
          where: { githubId: githubUser.id ? githubUser.id.toString() : `sim_${githubUser.login}` },
          update: {
            name: githubUser.name || githubUser.login,
            avatarUrl: githubUser.avatar_url,
            accessToken: githubUser.token || "simulated_token",
          },
          create: {
            githubId: githubUser.id ? githubUser.id.toString() : `sim_${githubUser.login}`,
            githubLogin: githubUser.login,
            email: githubUser.email || `${githubUser.login}@example.com`,
            name: githubUser.name || githubUser.login,
            avatarUrl: githubUser.avatar_url,
            accessToken: githubUser.token || "simulated_token",
          },
        });

        await prisma.profile.upsert({
          where: { userId: user.id },
          update: {
            skills: JSON.stringify(skills),
            level,
            interest,
            repos: recommendations.repos as any,
          },
          create: {
            userId: user.id,
            skills: JSON.stringify(skills),
            level,
            interest,
            repos: recommendations.repos as any,
          },
        });
      } catch (dbErr) {
        console.error("Failed to save profile in database:", dbErr);
      }
    }

    return res.json(recommendations);
  } catch (err) {
    console.error("API /api/recommend errored out. Falling back to live data.", err);
    const { skills = [], level = "Beginner", interest = "Frontend", githubUser = null } = req.body;
    const recommendations = await getLiveGitHubRecommendations(skills, level, interest);

    if (githubUser && recommendations && recommendations.repos) {
      try {
        const user = await prisma.user.upsert({
          where: { githubId: githubUser.id ? githubUser.id.toString() : `sim_${githubUser.login}` },
          update: {
            name: githubUser.name || githubUser.login,
            avatarUrl: githubUser.avatar_url,
            accessToken: githubUser.token || "simulated_token",
          },
          create: {
            githubId: githubUser.id ? githubUser.id.toString() : `sim_${githubUser.login}`,
            githubLogin: githubUser.login,
            email: githubUser.email || `${githubUser.login}@example.com`,
            name: githubUser.name || githubUser.login,
            avatarUrl: githubUser.avatar_url,
            accessToken: githubUser.token || "simulated_token",
          },
        });

        await prisma.profile.upsert({
          where: { userId: user.id },
          update: {
            skills: JSON.stringify(skills),
            level,
            interest,
            repos: recommendations.repos as any,
          },
          create: {
            userId: user.id,
            skills: JSON.stringify(skills),
            level,
            interest,
            repos: recommendations.repos as any,
          },
        });
      } catch (dbErr) {
        console.error("Failed to save profile in database:", dbErr);
      }
    }

    return res.json(recommendations);
  }
});

app.post("/api/roadmap", async (req, res) => {
  try {
    const { skills = [], level = "Beginner", githubUser = null } = req.body;
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
        model: "gemini-3.5-flash",
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
              week4: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
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
      try {
        const user = await prisma.user.findUnique({
          where: { githubId: githubUser.id ? githubUser.id.toString() : `sim_${githubUser.login}` },
          include: { profile: true }
        });

        if (user && user.profile) {
          // Delete any existing roadmap to overwrite it cleanly
          const existingRoadmap = await prisma.roadmap.findUnique({
            where: { profileId: user.profile.id }
          });
          if (existingRoadmap) {
            await prisma.roadmap.delete({ where: { id: existingRoadmap.id } });
          }

          // Create new Roadmap with Weeks and Tasks
          await prisma.roadmap.create({
            data: {
              profileId: user.profile.id,
              weeks: {
                create: [
                  {
                    weekNumber: 1,
                    tasks: {
                      create: (roadmapData.week1 || []).map((t: string) => ({ taskText: t, isCompleted: false }))
                    }
                  },
                  {
                    weekNumber: 2,
                    tasks: {
                      create: (roadmapData.week2 || []).map((t: string) => ({ taskText: t, isCompleted: false }))
                    }
                  },
                  {
                    weekNumber: 3,
                    tasks: {
                      create: (roadmapData.week3 || []).map((t: string) => ({ taskText: t, isCompleted: false }))
                    }
                  },
                  {
                    weekNumber: 4,
                    tasks: {
                      create: (roadmapData.week4 || []).map((t: string) => ({ taskText: t, isCompleted: false }))
                    }
                  }
                ]
              }
            }
          });
        }
      } catch (dbErr) {
        console.error("Failed to save roadmap in database:", dbErr);
      }
    }

    return res.json(roadmapData);
  } catch (err) {
    console.error("API /api/roadmap errored out. Falling back to mock data.", err);
    const { skills = [], level = "Beginner", githubUser = null } = req.body;
    const roadmapData = getFallbackRoadmap(skills, level);

    if (githubUser && roadmapData) {
      try {
        const user = await prisma.user.findUnique({
          where: { githubId: githubUser.id ? githubUser.id.toString() : `sim_${githubUser.login}` },
          include: { profile: true }
        });

        if (user && user.profile) {
          const existingRoadmap = await prisma.roadmap.findUnique({
            where: { profileId: user.profile.id }
          });
          if (existingRoadmap) {
            await prisma.roadmap.delete({ where: { id: existingRoadmap.id } });
          }

          await prisma.roadmap.create({
            data: {
              profileId: user.profile.id,
              weeks: {
                create: [
                  {
                    weekNumber: 1,
                    tasks: {
                      create: (roadmapData.week1 || []).map((t: string) => ({ taskText: t, isCompleted: false }))
                    }
                  },
                  {
                    weekNumber: 2,
                    tasks: {
                      create: (roadmapData.week2 || []).map((t: string) => ({ taskText: t, isCompleted: false }))
                    }
                  },
                  {
                    weekNumber: 3,
                    tasks: {
                      create: (roadmapData.week3 || []).map((t: string) => ({ taskText: t, isCompleted: false }))
                    }
                  },
                  {
                    weekNumber: 4,
                    tasks: {
                      create: (roadmapData.week4 || []).map((t: string) => ({ taskText: t, isCompleted: false }))
                    }
                  }
                ]
              }
            }
          });
        }
      } catch (dbErr) {
        console.error("Failed to save roadmap in database:", dbErr);
      }
    }

    return res.json(roadmapData);
  }
});

app.post("/api/explain", async (req, res) => {
  try {
    const { issue = "" } = req.body;
    if (!issue.trim()) {
      return res.status(400).json({ error: "No raw issue description provided." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      console.log("Serving simulated issue translation...");
      return res.json(getFallbackExplanation(issue));
    }

    const promptMessage = `Act as an expert technical translator. Simplify the following technical GitHub issue text into a plain English, highly accessible and non-intimidating format for a first-time open source developer.

GitHub Issue:
"${issue}"

Requirements:
- "meaning": A clear, simple explanation under 100 words of what the issue actually is and why it matters in plain, non-jargon English.
- "files": An array of 2 to 3 file names or directory/module paths that are highly likely to be involved or where the developer should look first (realistic files based on general app structure!).
- "steps": An array of 3 to 4 sequential, actionable steps to investigate or solve the problem.

Always output response strictly in the following JSON format structure:
{
  "meaning": "simplified plain explanation",
  "files": ["file path 1", "file path 2"],
  "steps": ["action step 1", "action step 2", "action step 3"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["meaning", "files", "steps"],
          properties: {
            meaning: { type: Type.STRING },
            files: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Likely files involved" },
            steps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Action steps to solve" }
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      try {
        const parsedData = JSON.parse(text);
        return res.json(parsedData);
      } catch (jsonErr) {
        console.error("Failed to parse Gemini issue explanation JSON. Text was:", text);
        return res.json(getFallbackExplanation(issue));
      }
    } else {
      return res.json(getFallbackExplanation(issue));
    }
  } catch (err) {
    console.error("API /api/explain errored out. Falling back to mock data.", err);
    const { issue = "" } = req.body;
    return res.json(getFallbackExplanation(issue));
  }
});

app.get("/api/user/:login", async (req, res) => {
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

app.post("/api/roadmap/task/toggle", async (req, res) => {
  try {
    const { login, taskText, isCompleted } = req.body;

    const user = await prisma.user.findFirst({
      where: { githubLogin: login },
      include: { profile: { include: { roadmap: { include: { weeks: { include: { tasks: true } } } } } } }
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
        completedAt: isCompleted ? new Date() : null
      }
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Failed to toggle roadmap task:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/user/:login/reset", async (req, res) => {
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

// GitHub OAuth configuration & variables
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";

// OAuth config endpoint
app.get("/api/auth/config", (req, res) => {
  res.json({
    hasClientId: !!GITHUB_CLIENT_ID,
    clientId: GITHUB_CLIENT_ID,
  });
});

// Get authorizable direct redirect provider URL
app.get("/api/auth/url", (req, res) => {
  const host = req.headers.host || "localhost:3000";
  const protocol = req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  const redirectUri = process.env.APP_URL
    ? `${process.env.APP_URL.replace(/\/$/, "")}/auth/callback`
    : `${protocol}://${host}/auth/callback`;

  // Generate secure random state token
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  res.setHeader("Set-Cookie", `ob_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax`);

  if (!GITHUB_CLIENT_ID) {
    return res.json({
      simulated: true,
      url: `/auth/simulated-authorize?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`,
    });
  }

  const oauthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,public_repo&state=${state}`;
  res.json({ simulated: false, url: oauthUrl });
});

// OAuth Callback handler with messaging
app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
  const { code, state } = req.query;

  const cookies = parseCookies(req.headers.cookie);
  const expectedState = cookies["ob_oauth_state"];

  // Clear state cookie
  res.setHeader("Set-Cookie", "ob_oauth_state=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");

  if (!state || !expectedState || state !== expectedState) {
    return res.status(400).send("Anti-Forgery CSRF Validation Failed. State mismatch.");
  }

  if (!code) {
    return res.status(400).send("Authorization code missing from callback");
  }

  let userSession = null;

  if (code === "simulated_code_openbridge") {
    // Immersive login simulated session
    userSession = {
      login: "guest-committer",
      name: "Guest Committer",
      avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
      bio: "Active Open-Source Contributor transitioning to production engineering systems.",
      html_url: "https://github.com/guest-committer",
      public_repos: 42,
      followers: 128,
      token: "simulated_token_xyz",
      simulated: true
    };
  } else {
    try {
      const host = req.headers.host || "localhost:3000";
      const protocol = req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const redirectUri = process.env.APP_URL
        ? `${process.env.APP_URL.replace(/\/$/, "")}/auth/callback`
        : `${protocol}://${host}/auth/callback`;

      // Exchange code for real target GitHub access token
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: redirectUri
        })
      });

      const tokenJson: any = await tokenResponse.json();

      if (tokenJson.error) {
        throw new Error(tokenJson.error_description || tokenJson.error);
      }

      const accessToken = tokenJson.access_token;

      // Extract details about the authorized GitHub user
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "User-Agent": "openbridge-mentor-app"
        }
      });

      const userJson: any = await userResponse.json();

      userSession = {
        login: userJson.login,
        name: userJson.name || userJson.login,
        avatar_url: userJson.avatar_url,
        bio: userJson.bio || "Open-source developer",
        html_url: userJson.html_url,
        public_repos: userJson.public_repos,
        followers: userJson.followers,
        token: accessToken,
        simulated: false
      };
    } catch (err: any) {
      console.error("Failed to authenticate with real GitHub API: ", err.message);
      return res.status(500).send(`Authentication session exchange failed: ${err.message}`);
    }
  }

  // Send success message to layout and close standard pop-up window
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authorization Successful</title>
        <style>
          body {
            background-color: #0d1117;
            color: #f0f6fc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            overflow: hidden;
          }
          .box {
            text-align: center;
            padding: 24px;
            background-color: #161b22;
            border: 1px solid #30363d;
            border-radius: 8px;
            max-width: 400px;
          }
          .spinner {
            border: 3px solid #30363d;
            border-top: 3px solid #238636;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
            margin: 16px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="box">
          <h2>Authentication Successful</h2>
          <div class="spinner"></div>
          <p style="color: #8b949e; font-size: 13px;">Transferred session credentials to main workstation. Closing this window...</p>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({ 
              type: "OAUTH_AUTH_SUCCESS",
              user: ${JSON.stringify(userSession)}
            }, "*");
            window.close();
          } else {
            window.location.href = "/";
          }
        </script>
      </body>
    </html>
  `);
});

// A route to render simulated authorization UI in an elegant popup
app.get("/auth/simulated-authorize", (req, res) => {
  const { redirect_uri, state } = req.query;
  const decodedRedirectUri = decodeURIComponent(redirect_uri as string || "/auth/callback");
  const stateVal = (state as string) || "";

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authorize OpenBridge (Simulated)</title>
        <style>
          body {
            background-color: #0d1117;
            color: #f0f6fc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 32px 16px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            box-sizing: border-box;
          }
          .card {
            background-color: #161b22;
            border: 1px solid #30363d;
            border-radius: 8px;
            width: 100%;
            max-width: 440px;
            padding: 24px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin-bottom: 24px;
          }
          .avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 1px solid #30363d;
            background-color: #21262d;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .connector-line {
            height: 2px;
            background-color: #30363d;
            flex-grow: 1;
            max-width: 60px;
            position: relative;
          }
          .connector-line::after {
            content: "✓";
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #0d1117;
            border: 1px solid #30363d;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #238636;
          }
          h3 {
            margin: 0 0 8px 0;
            text-align: center;
            font-size: 16px;
            font-weight: 600;
          }
          .subtitle {
            text-align: center;
            color: #8b949e;
            font-size: 13px;
            margin-bottom: 24px;
          }
          .permissions {
            background-color: #0d1117;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 24px;
          }
          .permission-item {
            display: flex;
            gap: 12px;
            font-size: 13px;
            margin-bottom: 12px;
          }
          .permission-item:last-child {
            margin-bottom: 0;
          }
          .permission-icon {
            color: #2f81f7;
            font-weight: bold;
          }
          .actions {
            display: flex;
            gap: 12px;
          }
          .btn {
            flex: 1;
            padding: 10px 16px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            text-align: center;
            transition: all 0.1s ease;
          }
          .btn-cancel {
            background-color: #21262d;
            border: 1px solid #30363d;
            color: #c9d1d9;
          }
          .btn-cancel:hover {
            background-color: #30363d;
          }
          .btn-auth {
            background-color: #238636;
            border: 1px solid rgba(240,246,252,0.1);
            color: #ffffff;
            font-family: inherit;
          }
          .btn-auth:hover {
            background-color: #2ea44f;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="avatar">
              <svg width="24" height="24" viewBox="0 0 16 16" fill="#f0f6fc"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 01-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.35 2.69.91 0 .67.01 1.3.01 1.5 0 .21-.15.46-.55.38A8.013 8.013 0 010 8c0-4.42 3.58-8 8-8z"/></svg>
            </div>
            <div class="connector-line"></div>
            <div class="avatar" style="border-color: #2f81f7;">
              <span style="font-weight: bold; font-size: 14px; color: #2f81f7; font-family: monospace;">OB</span>
            </div>
          </div>
          
          <h3>Authorize OpenBridge</h3>
          <div class="subtitle">by <span style="color: #2f81f7;">OpenBridge Sandbox</span> • openbridge-mentor-app</div>
          
          <div class="permissions">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #8b949e; margin-bottom: 12px; letter-spacing: 0.5px;">Requested Permissions</div>
            
            <div class="permission-item">
              <span class="permission-icon">✓</span>
              <div>
                <strong style="color: #f0f6fc; display: block;">Personal user data</strong>
                <span style="color: #8b949e; font-size: 11px;">Read email addresses, full name, profile avatar, and bio summaries.</span>
              </div>
            </div>
            
            <div class="permission-item" style="margin-top: 10px;">
              <span class="permission-icon">✓</span>
              <div>
                <strong style="color: #f0f6fc; display: block;">Repositories</strong>
                <span style="color: #8b949e; font-size: 11px;">Search public repositories, track forks, and view active commit lines.</span>
              </div>
            </div>
          </div>
          
          <div class="actions">
            <button class="btn btn-cancel" onclick="window.close()">Cancel</button>
            <button class="btn btn-auth" onclick="handleAuthorize()">Authorize guest-committer</button>
          </div>
        </div>
        
        <script>
          function handleAuthorize() {
            window.location.href = "${decodedRedirectUri}?code=simulated_code_openbridge&state=${stateVal}";
          }
        </script>
      </body>
    </html>
  `);
});

// Vite middleware integration
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

startServer();
