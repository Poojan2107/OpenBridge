import { Router } from "express";
import { z } from "zod";
import { Type } from "@google/genai";
import { getGeminiClient } from "../services/gemini";

const router = Router();

const InterviewSchema = z.object({
  skills: z.array(z.string()).optional().default([]),
  level: z.string().optional().default("Beginner"),
  interest: z.string().optional().default("Frontend"),
});

router.post("/api/interview", async (req, res) => {
  try {
    const parseResult = InterviewSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid request payload format.", details: parseResult.error.format() });
    }

    const { skills, level, interest } = parseResult.data;
    const skillList = skills.length > 0 ? skills.join(", ") : "General Programming";

    const ai = getGeminiClient();

    // Heuristic fallback
    if (!ai) {
      const isWeb = /frontend|react|vue|angular|css|html|web/i.test(`${interest} ${skillList}`);
      const isBackend = /backend|node|express|python|django|api|sql|database/i.test(`${interest} ${skillList}`);

      const questions = isWeb ? [
        {
          question: "Explain the difference between `useMemo` and `useCallback` in React. When would you use each?",
          difficulty: "intermediate",
          topic: "React Hooks",
          hint: "Think about what each one memoizes — a value vs. a function reference.",
          whatInterviewersLookFor: "Understanding of referential equality, re-render optimization, and when NOT to use them (premature optimization)."
        },
        {
          question: "What is the CSS Box Model? How does `box-sizing: border-box` change the default behavior?",
          difficulty: "beginner",
          topic: "CSS Fundamentals",
          hint: "Draw out the layers: content → padding → border → margin.",
          whatInterviewersLookFor: "Clear mental model of how width/height are calculated and why border-box is preferred in modern layouts."
        },
        {
          question: "You notice a component re-renders 50 times per second when the user types in a search box. How would you fix it?",
          difficulty: "intermediate",
          topic: "Performance",
          hint: "Consider debouncing, controlled vs uncontrolled inputs, and React.memo.",
          whatInterviewersLookFor: "Systematic debugging approach: identify the cause first (state updates), then apply the right tool (debounce, not just memo everything)."
        },
        {
          question: "What is a closure in JavaScript? Give a practical example where closures are useful.",
          difficulty: "beginner",
          topic: "JavaScript Core",
          hint: "A function that 'remembers' variables from its outer scope even after that scope has finished executing.",
          whatInterviewersLookFor: "Real understanding, not textbook definition. Bonus points for mentioning event handlers, data privacy, or factory functions."
        },
        {
          question: "Walk me through what happens from the moment a user types a URL in the browser to seeing the rendered page.",
          difficulty: "advanced",
          topic: "Web Fundamentals",
          hint: "DNS → TCP → TLS → HTTP request → server response → HTML parsing → CSSOM → render tree → paint.",
          whatInterviewersLookFor: "Breadth of knowledge across networking, browser internals, and rendering pipeline. Depth at any single step is a bonus."
        }
      ] : isBackend ? [
        {
          question: "What is the difference between SQL and NoSQL databases? When would you choose one over the other?",
          difficulty: "beginner",
          topic: "Databases",
          hint: "Think about data structure, relationships, scalability patterns, and query flexibility.",
          whatInterviewersLookFor: "Nuanced answer — not 'NoSQL is faster'. They want to hear about trade-offs: ACID vs eventual consistency, schema flexibility vs query power."
        },
        {
          question: "Explain what middleware is in Express.js. Write a simple logging middleware.",
          difficulty: "beginner",
          topic: "Node.js / Express",
          hint: "Middleware is a function with (req, res, next) that sits between the request and your route handler.",
          whatInterviewersLookFor: "Understanding of the request pipeline, the importance of calling next(), and practical use cases (auth, logging, CORS)."
        },
        {
          question: "What is a race condition? Give an example in a web application context.",
          difficulty: "intermediate",
          topic: "Concurrency",
          hint: "Two operations that depend on timing — e.g., two API calls updating the same record simultaneously.",
          whatInterviewersLookFor: "Awareness of concurrency issues even in single-threaded Node.js (async operations). Mention of solutions: locks, optimistic concurrency, transactions."
        },
        {
          question: "How would you design a rate limiter for an API? What data structures would you use?",
          difficulty: "intermediate",
          topic: "System Design",
          hint: "Consider sliding window, token bucket, or fixed window counters. Think about storage (in-memory vs Redis).",
          whatInterviewersLookFor: "Systematic thinking: define the constraint, choose algorithm, discuss trade-offs, mention distributed concerns."
        },
        {
          question: "What is the N+1 query problem in ORMs? How do you solve it?",
          difficulty: "advanced",
          topic: "Database Performance",
          hint: "Loading a list of items, then making one query per item to load related data. Solution: eager loading / joins.",
          whatInterviewersLookFor: "Practical experience with ORMs, understanding of query optimization, and ability to spot performance anti-patterns."
        }
      ] : [
        {
          question: "What is the difference between a stack and a queue? Give a real-world analogy for each.",
          difficulty: "beginner",
          topic: "Data Structures",
          hint: "Stack = plate stack (LIFO). Queue = checkout line (FIFO).",
          whatInterviewersLookFor: "Clear analogies and understanding of when to use each in code (undo systems, BFS vs DFS, etc.)."
        },
        {
          question: "Explain Big O notation. What's the difference between O(n) and O(n²)?",
          difficulty: "beginner",
          topic: "Algorithms",
          hint: "Big O describes how runtime scales as input grows. O(n²) means nested iteration.",
          whatInterviewersLookFor: "Intuitive understanding, not just memorized definitions. Can they look at code and estimate its complexity?"
        },
        {
          question: "What is version control? Why do open-source projects require pull requests instead of direct commits?",
          difficulty: "beginner",
          topic: "Git & Collaboration",
          hint: "Think about code review, history tracking, and collaboration safety.",
          whatInterviewersLookFor: "Understanding of collaborative development workflows, not just git commands."
        },
        {
          question: "Describe the SOLID principles. Pick one and explain how violating it causes problems.",
          difficulty: "intermediate",
          topic: "Software Design",
          hint: "S = Single Responsibility, O = Open/Closed, L = Liskov Substitution, I = Interface Segregation, D = Dependency Inversion.",
          whatInterviewersLookFor: "Practical understanding with a real example, not just reciting the acronym."
        },
        {
          question: "How would you debug a function that returns the wrong output but doesn't throw an error?",
          difficulty: "intermediate",
          topic: "Debugging",
          hint: "Systematic approach: check inputs, add breakpoints/logs at key steps, isolate the failing logic, write a test case.",
          whatInterviewersLookFor: "Methodical debugging process rather than random guessing. Mention of tools (debugger, logs, tests)."
        }
      ];

      return res.json({ questions });
    }

    const prompt = `You are a senior engineering interviewer at a top tech company preparing a mock interview for a developer with:
Skills: ${skillList}
Experience Level: ${level}
Area of Interest: ${interest}

Generate exactly 5 technical interview questions that are realistic, progressively harder, and directly relevant to their skill set. For each question provide:
- "question": The actual interview question (specific, not generic)
- "difficulty": "beginner", "intermediate", or "advanced"
- "topic": The technical topic area (e.g. "React Hooks", "SQL Joins", "Git Workflow")
- "hint": A short hint that nudges them toward the answer without giving it away
- "whatInterviewersLookFor": What a real interviewer evaluates in the answer (2 sentences max)

Mix difficulties: 2 beginner, 2 intermediate, 1 advanced. Make questions specific to ${interest} and ${skillList}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["questions"],
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["question", "difficulty", "topic", "hint", "whatInterviewersLookFor"],
                properties: {
                  question: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  whatInterviewersLookFor: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty Gemini response");

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "Failed to parse interview response." });
    }

    return res.json(data);
  } catch (err) {
    console.error("POST /api/interview error:", err);
    return res.status(500).json({ error: "Interview generation failed. Please try again." });
  }
});

export default router;
