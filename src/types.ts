export interface UserProfile {
  skills: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
  interest:
    "Frontend" | "Backend" | "Fullstack" | "AI / Machine Learning" | "DevOps / Infrastructure";
}

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  html_url: string;
  public_repos: number;
  followers: number;
  token?: string;
  simulated?: boolean;
}

export interface RepositorySuggestion {
  name: string;
  description: string;
  match: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  reason?: string;
  issues: string[];
}

export interface PersonalizedRoadmap {
  week1: string[];
  week2: string[];
  week3: string[];
  week4: string[];
}

export interface IssueTranslation {
  meaning: string;
  files: string[];
  steps: string[];
}

export interface OpenSourceProgram {
  name: string;
  description: string;
  timeline: string;
  tag: string;
  url: string;
  iconName: string;
}
