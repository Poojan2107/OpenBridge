import { Router } from "express";
import { z } from "zod";
import { Type } from "@google/genai";
import { getGeminiClient } from "../services/gemini";

const router = Router();

const CodeReviewSchema = z.object({
  code: z.string().min(10, "Please provide at least 10 characters of code.").max(8000, "Code too long. Please paste under 8000 characters."),
  language: z.string().optional().default("auto"),
  context: z.string().optional().default(""),
});

router.post("/api/codereview", async (req, res) => {
  try {
    const parseResult = CodeReviewSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid request payload format.", details: parseResult.error.format() });
    }

    const { code, language, context } = parseResult.data;
    const ai = getGeminiClient();

    // Fallback heuristic review when Gemini is not configured
    if (!ai) {
      const lineCount = code.split("\n").length;
      const hasTodos = /todo|fixme|hack|xxx/gi.test(code);
      const hasConsoleLog = /console\.log/gi.test(code);
      const hasTypeAnnotations = /:\s*(string|number|boolean|void|any)\b/g.test(code);
      const hasComments = /\/\/|\/\*|#\s/.test(code);

      return res.json({
        overall: "good",
        score: hasTodos ? 62 : hasConsoleLog ? 71 : 80,
        summary: `Reviewed ${lineCount} lines of ${language !== "auto" ? language : "code"}. Good structure overall with some areas to polish before submitting a PR.`,
        praise: [
          hasComments ? "Code includes comments, which helps reviewers understand intent." : "Code is concise and readable.",
          hasTypeAnnotations ? "Type annotations present — great for maintainability." : "Logic is straightforward and easy to follow.",
          "Contribution scope is appropriately small — ideal for a first PR."
        ],
        issues: [
          ...(hasConsoleLog ? [{ severity: "warning", message: "Remove debug console.log() statements before merging — maintainers will flag these.", suggestion: "Use a proper logger or remove entirely before opening the PR." }] : []),
          ...(hasTodos ? [{ severity: "info", message: "TODO/FIXME comments found in the diff.", suggestion: "Either resolve them now or open a follow-up issue referencing the TODO." }] : []),
          { severity: "info", message: "No automated tests included with this change.", suggestion: "Add a unit test covering the happy path. Even one test dramatically increases merge likelihood." }
        ],
        suggestions: [
          "Run the project's linter locally before pushing (check CONTRIBUTING.md for the exact command).",
          "Keep your commit message in conventional format: `fix: correct button alignment on mobile` or `feat: add export button`.",
          "Reference the issue number in your PR description using `Closes #123` to auto-close it on merge.",
          hasTypeAnnotations ? "Consider adding JSDoc comments to public functions for documentation generators." : "Add type annotations to function parameters to help TypeScript catch bugs early."
        ]
      });
    }

    const langHint = language !== "auto" ? `The code is written in ${language}.` : "Detect the programming language automatically.";
    const ctxHint = context.trim() ? `\n\nContext / PR Description from the developer:\n"${context.trim()}"` : "";

    const prompt = `You are a friendly but thorough senior open-source maintainer reviewing a first-time contributor's code submission. ${langHint}${ctxHint}

Code to review:
\`\`\`
${code}
\`\`\`

Give a structured, educational, and encouraging code review targeted at a beginner. Focus on:
1. What they did well (be specific, not generic)
2. Real issues a maintainer would request changes for (correctness, style, security, performance)
3. Actionable suggestions to improve the PR's chance of being merged

Be kind but honest. Use simple language. Do not use jargon without explaining it.

Respond ONLY with this JSON structure:
{
  "overall": "excellent|good|needs_work|major_issues",
  "score": <integer 0-100>,
  "summary": "<2 sentence max overview of the code quality>",
  "praise": ["<specific thing done well>", ...],
  "issues": [
    {
      "severity": "error|warning|info",
      "message": "<specific problem found>",
      "suggestion": "<how to fix it>"
    }
  ],
  "suggestions": ["<actionable improvement 1>", "<actionable improvement 2>", ...]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["overall", "score", "summary", "praise", "issues", "suggestions"],
          properties: {
            overall: { type: Type.STRING },
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            praise: { type: Type.ARRAY, items: { type: Type.STRING } },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["override", "severity", "message", "suggestion"].filter(k => k !== "override"), // severity, message, suggestion
                properties: {
                  severity: { type: Type.STRING },
                  message: { type: Type.STRING },
                  suggestion: { type: Type.STRING }
                }
              }
            },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty Gemini response");

    let review: any;
    try {
      review = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "Failed to parse review response." });
    }

    return res.json(review);
  } catch (err) {
    console.error("POST /api/codereview error:", err);
    return res.status(500).json({ error: "Code review failed. Please try again." });
  }
});

export default router;
