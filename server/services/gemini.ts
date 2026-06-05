import { GoogleGenAI } from "@google/genai";

// Lazy-initialize Gemini client to prevent startup crash if GEMINI_API_KEY is not configured yet
let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
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
export function getFallbackRecommendations(skills: string[], level: string, interest: string) {
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
          reason: "This project provides straightforward Markdown documentation files, making it an excellent match for beginner-friendly content edits.",
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
          reason: "Aligned to modern build tools using TypeScript, perfect for testing bundler asset cache performances.",
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
          reason: "Lucide icons require simple SVG manipulations and standard React wrappers, which aligns well with basic components learning.",
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
          reason: "Express is written in Javascript/Node, matching backend learners wanting to understand middleware routing stacks.",
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
          reason: "Perfect for Python developers interested in asynchronous request processing and type validations.",
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
          reason: "Provides direct SQL query interfaces in Node.js, great for validating transaction pools and connection controls.",
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
          reason: "Enables developing AI agent flows and orchestrations using Python, matching modern AI/ML application tooling.",
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
          reason: "An image helper library in Python requiring isolated drawing coordinates fixes, suitable for early learners.",
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
          reason: "The industry standard repository for pre-trained AI models, ideal for intermediate PyTorch learners.",
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
          reason: "Focuses on CLI parameter styling and WSL configurations, ideal for DevOps learners.",
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
          reason: "Written in Python, this project helps DevOps enthusiasts understand playbook scripting variables.",
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
          reason: "Requires shell script customizations and theme adjustments, very beginner-friendly for shell scripting.",
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
export function getFallbackRoadmap(skills: string[], level: string) {
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
export function getFallbackExplanation(issueText: string) {
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

export async function getLiveGitHubRecommendations(skills: string[], level: string, interest: string) {
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
          reason: `Matches your interest in ${interest} and proficiency in ${skills.join(", ") || "General Programming"}.`,
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
