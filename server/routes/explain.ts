import { Router } from "express";
import { z } from "zod";
import { Type } from "@google/genai";
import { getGeminiClient, getFallbackExplanation } from "../services/gemini";

const router = Router();

const ExplainSchema = z.object({
  issue: z.string().min(1, "No raw issue description or URL provided."),
});

router.post("/api/explain", async (req, res) => {
  try {
    const parseResult = ExplainSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid request payload format.", details: parseResult.error.format() });
    }

    let { issue } = parseResult.data;
    const githubIssueRegex = /github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/i;
    const match = issue.match(githubIssueRegex);
    let isUrl = false;
    let fetchedIssueTitle = "";

    if (match) {
      const owner = match[1];
      const repo = match[2];
      const issueNumber = match[3];
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;

      try {
        console.log(`Fetching issue details from GitHub API: ${apiUrl}`);
        const response = await fetch(apiUrl, {
          headers: {
            "User-Agent": "openbridge-mentor-app",
            "Accept": "application/vnd.github.v3+json"
          }
        });

        if (response.ok) {
          const issueData: any = await response.json();
          fetchedIssueTitle = issueData.title;
          issue = `Title: ${issueData.title}\n\nDescription:\n${issueData.body || "No description provided."}`;
          isUrl = true;
          console.log(`Successfully fetched issue "${fetchedIssueTitle}"`);
        } else {
          console.warn(`GitHub API returned status ${response.status} for URL: ${apiUrl}. Falling back to raw text.`);
        }
      } catch (fetchErr) {
        console.error("Failed to fetch issue from GitHub API:", fetchErr);
      }
    }

    const ai = getGeminiClient();
    if (!ai) {
      console.log("Serving simulated issue translation...");
      const explanation = getFallbackExplanation(issue);
      if (isUrl && fetchedIssueTitle) {
        explanation.meaning = `[Live URL: ${fetchedIssueTitle}] ${explanation.meaning}`;
      }
      return res.json(explanation);
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
      model: "gemini-2.5-flash",
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

export default router;
