import { Router } from "express";
import { z } from "zod";
import { Type } from "@google/genai";
import { getGeminiClient, getLiveGitHubRecommendations } from "../services/gemini";
import { saveUserProfile } from "../services/db";

const router = Router();

const RecommendSchema = z.object({
  skills: z.array(z.string()).optional().default([]),
  level: z.string().optional().default("Beginner"),
  interest: z.string().optional().default("Frontend"),
  githubUser: z.any().nullable().optional(),
});

router.post("/api/recommend", async (req, res) => {
  try {
    const parseResult = RecommendSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid request payload format.", details: parseResult.error.format() });
    }

    const { skills, level, interest, githubUser } = parseResult.data;
    const ai = getGeminiClient();
    let recommendations: any = null;

    if (!ai) {
      console.log("No valid GEMINI_API_KEY environment variable found. Falling back to structured local simulation.");
      recommendations = await getLiveGitHubRecommendations(skills, level, interest);
    } else {
      const promptMessage = `Act as an experienced open-source engineering coordinator and mentor. Recommend exactly 3 active, beginner-friendly open-source GitHub repositories based on the contributor's target profile:
Skills: ${skills.join(", ") || "General Programming"}
Experience Level: ${level}
Area of Interest: ${interest}

The output must consist of exactly 1 key: "repos". The repos value should be an array of exactly 3 objects. Each repository object should contain exactly these fields: "name" (e.g. "facebook/react"), "description", "match" (e.g. "95%"), "difficulty" (should match experience level), "reason" (a short 1-2 sentence personalized explanation of why this repo is a great match for their specific skill set and interests), and "issues" (an array of 3 highly actionable, beginner-friendly mock task titles for issues they could solve).

Always output response strictly in the following JSON format structure:
{
  "repos": [
    {
      "name": "owner/repo",
      "description": "Short description of the repository",
      "match": "XX%",
      "difficulty": "${level}",
      "reason": "Personalized explanation matching their skills.",
      "issues": ["Mock issue title 1", "Mock issue title 2", "Mock issue title 3"]
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
                items: {
                  type: Type.OBJECT,
                  required: ["name", "description", "match", "difficulty", "reason", "issues"],
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    match: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    issues: { type: Type.ARRAY, items: { type: Type.STRING } }
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
      await saveUserProfile(githubUser, skills, level, interest, recommendations.repos);
    }

    return res.json(recommendations);
  } catch (err) {
    console.error("API /api/recommend errored out. Falling back to live data.", err);
    const { skills = [], level = "Beginner", interest = "Frontend", githubUser = null } = req.body;
    const recommendations = await getLiveGitHubRecommendations(skills, level, interest);

    if (githubUser && recommendations && recommendations.repos) {
      try {
        await saveUserProfile(githubUser, skills, level, interest, recommendations.repos);
      } catch (dbErr) {
        console.error("Failed to save profile in database fallback:", dbErr);
      }
    }

    return res.json(recommendations);
  }
});

export default router;
