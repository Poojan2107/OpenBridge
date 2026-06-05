import React, { useState, useEffect } from "react";
import ProfilingForm from "./components/ProfilingForm";
import GithubLandingPage from "./components/GithubLandingPage";
import RepoRecommender from "./components/RepoRecommender";
import ContributionRoadmap from "./components/ContributionRoadmap";
import IssueTranslator from "./components/IssueTranslator";
import OpportunityLayer from "./components/OpportunityLayer";
import ChallengeHub from "./components/ChallengeHub";
import PreflightConsole from "./components/PreflightConsole";
import GithubFileExplorer from "./components/GithubFileExplorer";
import LevelBadge from "./components/LevelBadge";
import CodeReview from "./components/CodeReview";
import MockInterview from "./components/MockInterview";
import StreakHeatmap, { recordActivity } from "./components/StreakHeatmap";
import { UserProfile, RepositorySuggestion, PersonalizedRoadmap, IssueTranslation, GitHubUser } from "./types";
import { 
  Compass, 
  Sparkles, 
  BookOpen, 
  GitPullRequest, 
  HelpCircle, 
  Terminal, 
  ArrowUpRight, 
  Award, 
  Flame, 
  RefreshCw, 
  Star, 
  Layers, 
  Code, 
  Play, 
  Eye, 
  GitFork, 
  Shield, 
  Tag, 
  Lock, 
  AlertCircle, 
  Settings, 
  Github,
  Search,
  Bell,
  User,
  CheckCircle,
  Menu
} from "lucide-react";

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("ob_profile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [activityRefresh, setActivityRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState<"dashboard" | "challenge" | "preflight" | "translator" | "programs" | "codereview" | "interview">(() => {
    try {
      const saved = localStorage.getItem("ob_active_tab");
      if (saved) return saved as any;
    } catch {}
    return "dashboard";
  });
  const [apiError, setApiError] = useState<string | null>(null);

  // GitHub user profile session (real or simulated feedback)
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(() => {
    try {
      const saved = localStorage.getItem("ob_github_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Simulated GitHub interaction states
  const [stars, setStars] = useState(() => {
    const saved = localStorage.getItem("ob_stars");
    return saved ? parseInt(saved, 10) : 412;
  });
  const [starred, setStarred] = useState(() => localStorage.getItem("ob_starred") === "true");
  const [watches, setWatches] = useState(() => {
    const saved = localStorage.getItem("ob_watches");
    return saved ? parseInt(saved, 10) : 18;
  });
  const [watched, setWatched] = useState(() => localStorage.getItem("ob_watched") === "true");
  const [forks, setForks] = useState(() => {
    const saved = localStorage.getItem("ob_forks");
    return saved ? parseInt(saved, 10) : 89;
  });
  const [forked, setForked] = useState(() => localStorage.getItem("ob_forked") === "true");

  const [repos, setRepos] = useState<RepositorySuggestion[]>(() => {
    try {
      const saved = localStorage.getItem("ob_repos");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [roadmap, setRoadmap] = useState<PersonalizedRoadmap | null>(() => {
    try {
      const saved = localStorage.getItem("ob_roadmap");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [checkedRoadmapTasks, setCheckedRoadmapTasks] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem("ob_checked_roadmap_tasks");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [pullRequests, setPullRequests] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem("ob_profile", JSON.stringify(profile));
    } else {
      localStorage.removeItem("ob_profile");
    }
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("ob_active_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("ob_stars", stars.toString());
  }, [stars]);

  useEffect(() => {
    localStorage.setItem("ob_starred", starred ? "true" : "false");
  }, [starred]);

  useEffect(() => {
    localStorage.setItem("ob_watches", watches.toString());
  }, [watches]);

  useEffect(() => {
    localStorage.setItem("ob_watched", watched ? "true" : "false");
  }, [watched]);

  useEffect(() => {
    localStorage.setItem("ob_forks", forks.toString());
  }, [forks]);

  useEffect(() => {
    localStorage.setItem("ob_forked", forked ? "true" : "false");
  }, [forked]);

  useEffect(() => {
    localStorage.setItem("ob_repos", JSON.stringify(repos));
  }, [repos]);

  useEffect(() => {
    if (roadmap) {
      localStorage.setItem("ob_roadmap", JSON.stringify(roadmap));
    } else {
      localStorage.removeItem("ob_roadmap");
    }
  }, [roadmap]);

  useEffect(() => {
    localStorage.setItem("ob_checked_roadmap_tasks", JSON.stringify(checkedRoadmapTasks));
  }, [checkedRoadmapTasks]);

  // Establish continuous postMessage listeners to catch GitHub OAuth redirects
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost") && !origin.includes("127.0.0.1") && !origin.includes("0.0.0.0")) {
        return;
      }
      
      if (event.data?.type === "OAUTH_AUTH_SUCCESS" && event.data?.user) {
        const user = event.data.user;
        setGithubUser(user);
        localStorage.setItem("ob_github_user", JSON.stringify(user));
        
        // Auto-hydrate developer platform configuration if empty or placeholder
        if (!profile) {
          const matchedSkills = user.login === "guest-committer" 
            ? ["React", "TypeScript", "Node.js", "Git/GitHub"] 
            : ["JavaScript", "Git/GitHub"];
            
          const autoProfile: UserProfile = {
            skills: matchedSkills,
            level: "Beginner",
            interest: "Frontend"
          };
          handleSubmitProfile(autoProfile);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [profile]);

  // Sync state from database on startup or login
  useEffect(() => {
    if (githubUser) {
      const syncUserData = async () => {
        try {
          const res = await fetch(`/api/user/${githubUser.login}`);
          if (res.ok) {
            const data = await res.json();
            if (data.profile) {
              setProfile(data.profile);
            }
            if (data.repos && data.repos.length > 0) {
              setRepos(data.repos);
            }
            if (data.roadmap) {
              setRoadmap(data.roadmap);
            }
            if (data.checkedRoadmapTasks) {
              setCheckedRoadmapTasks(data.checkedRoadmapTasks);
            }
            if (data.pullRequests) {
              setPullRequests(data.pullRequests);
            }
          }
        } catch (err) {
          console.error("Failed to sync user data from database:", err);
        }
      };
      syncUserData();
    }
  }, [githubUser]);

  const handleConnectGithub = async () => {
    try {
      const res = await fetch("/api/auth/url");
      if (!res.ok) throw new Error("Could not request direct authorization path");
      const { url } = await res.json();
      
      const width = 500;
      const height = 660;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const authWindow = window.open(
        url,
        "github_login_popup",
        `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes`
      );
      
      if (!authWindow) {
        alert("The authentication pop-up was blocked. Please permit pop-ups to pair your GitHub login.");
      }
    } catch (err) {
      console.error("Initiation of GitHub Auth failed:", err);
    }
  };

  const handleConnectGuest = () => {
    const guestUser: GitHubUser = {
      login: "guest-committer",
      name: "Guest Committer",
      avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
      bio: "Active Open-Source React & TypeScript developer. Interested in building interactive web dashboards, tooling and modern system components.",
      html_url: "https://github.com/guest-committer",
      public_repos: 42,
      followers: 128,
      simulated: true
    };
    setGithubUser(guestUser);
    localStorage.setItem("ob_github_user", JSON.stringify(guestUser));
  };

  const handleDisconnectGithub = () => {
    setGithubUser(null);
    localStorage.removeItem("ob_github_user");
  };

  const handleToggleRoadmapTask = async (week: string, index: number) => {
    const key = `${week}-${index}`;
    const isCompletedNow = !checkedRoadmapTasks[key];
    setCheckedRoadmapTasks((prev) => ({ ...prev, [key]: isCompletedNow }));

    // Track activity for streak heatmap
    if (isCompletedNow) {
      recordActivity();
      setActivityRefresh(prev => prev + 1);
    }

    if (githubUser && roadmap) {
      const weekTasks = roadmap[week as keyof PersonalizedRoadmap];
      if (weekTasks && weekTasks[index]) {
        const taskText = weekTasks[index];
        try {
          await fetch("/api/roadmap/task/toggle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              login: githubUser.login,
              taskText,
              isCompleted: isCompletedNow
            })
          });
        } catch (err) {
          console.error("Failed to sync checklist toggle with database:", err);
        }
      }
    }
  };

  // Quick preset function for immediate onboarding
  const handleOnboardPreset = async () => {
    const presetProfile: UserProfile = {
      skills: ["React", "TypeScript", "Tailwind CSS"],
      level: "Beginner",
      interest: "Frontend"
    };
    await handleSubmitProfile(presetProfile);
  };

  const handleSubmitProfile = async (newProfile: UserProfile) => {
    setLoading(true);
    setApiError(null);
    setProfile(newProfile);

    try {
      // Parallel fetch to optimize response time
      const [recsRes, roadmapRes] = await Promise.all([
        fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skills: newProfile.skills,
            level: newProfile.level,
            interest: newProfile.interest,
            githubUser: githubUser // Dynamic customized suggestions based on GitHub profile contents
          })
        }),
        fetch("/api/roadmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skills: newProfile.skills,
            level: newProfile.level,
            githubUser: githubUser
          })
        })
      ]);

      if (recsRes.ok && roadmapRes.ok) {
        const recsData = await recsRes.json();
        const roadmapData = await roadmapRes.json();

        setRepos(recsData.repos || []);
        setRoadmap(roadmapData);
      } else {
        setApiError("Failed to fetch recommendations from backend server. Status error.");
        console.error("Server API error during recommendations fetch.");
      }
    } catch (err) {
      setApiError("A network error occurred. Please check that the backend is running and correct GITHUB_CLIENT_ID / GEMINI_API_KEY settings are configured.");
      console.error("API error: ", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateIssue = async (issueText: string): Promise<IssueTranslation | null> => {
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issue: issueText })
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (err) {
      console.error("API error during issue translation: ", err);
      return null;
    }
  };

  const handleResetProfile = async () => {
    if (githubUser) {
      try {
        await fetch(`/api/user/${githubUser.login}/reset`, { method: "POST" });
      } catch (err) {
        console.error("Failed to reset user profile in database:", err);
      }
    }
    setProfile(null);
    setRepos([]);
    setRoadmap(null);
    setCheckedRoadmapTasks({});
    setActiveTab("dashboard");
    localStorage.removeItem("ob_profile");
    localStorage.removeItem("ob_repos");
    localStorage.removeItem("ob_roadmap");
    localStorage.removeItem("ob_checked_roadmap_tasks");
    localStorage.removeItem("ob_submitted_prs");
    localStorage.removeItem("ob_pr_comments");
    localStorage.removeItem("ob_gpg_username");
    localStorage.removeItem("ob_gpg_email");
    localStorage.removeItem("ob_gpg_key");
    localStorage.removeItem("ob_quiz_answers");
    localStorage.removeItem("ob_quiz_submitted");
    localStorage.removeItem("ob_quiz_score");
    localStorage.removeItem("ob_system_checks");
    localStorage.removeItem("ob_active_tab");
  };

  if (!profile) {
    return (
      <GithubLandingPage
        githubUser={githubUser}
        onConnectGithub={handleConnectGithub}
        onConnectGuest={handleConnectGuest}
        onDisconnectGithub={handleDisconnectGithub}
        onOnboardPreset={handleOnboardPreset}
        onSubmitProfile={handleSubmitProfile}
        isLoading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] flex flex-col antialiased font-sans flex-grow">
      
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-30 bg-[#161b22] border-b border-[#30363d] h-14 flex items-center px-4 sm:px-6 select-none">
        <div className="w-full flex items-center justify-between">
          
          {/* Logo, title and branch indicator */}
          <div className="flex items-center gap-3">
            <div 
              onClick={handleResetProfile}
              className="flex items-center justify-center w-7 h-7 rounded-md bg-[#1f242c] border border-[#30363d] text-[#f0f6fc] hover:border-[#8b949e] cursor-pointer transition-colors"
            >
              <Github className="w-4 h-4" />
            </div>
            
            <div className="flex items-center gap-1.5" onClick={handleResetProfile}>
              <span className="text-sm font-semibold text-[#f0f6fc] tracking-tight hover:text-[#2f81f7] cursor-pointer">
                OpenBridge
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-[#30363d]/50 text-[#8b949e] border border-[#30363d] rounded-md">
                Mentor AI
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1 text-[11px] text-[#8b949e] font-mono pl-3 border-l border-[#30363d]">
              <span className="text-[#8b949e]">v2.6.5</span>
              <span className="text-[#30363d]">•</span>
              <span className="text-[#238636] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#238636]"></span>
                production-ready
              </span>
            </div>
          </div>

          {/* Center search bar (Inspired by GitHub command bar) */}
          <div className="hidden md:flex items-center flex-grow max-w-sm mx-8">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                readOnly
                placeholder="Search or jump to... (Press / to explore)"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-8 pr-3 py-1 text-xs text-[#f0f6fc] placeholder-[#8b949e] cursor-not-allowed text-left select-none text-[11px]"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#21262d] border border-[#30363d] text-[10px] text-[#8b949e] font-mono px-1.5 rounded-md">
                /
              </span>
            </div>
          </div>

          {/* Right menu bar: notifications, profile, fast support */}
          <div className="flex items-center gap-3">
            <button className="p-1.5 hover:bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc] rounded-md border border-transparent hover:border-[#30363d] transition-all relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#2f81f7]"></span>
            </button>

            <a 
              href={githubUser ? githubUser.html_url : "https://github.com/guest-committer/openbridge-onboarding-hub"} 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-[#8b949e] hover:text-[#f0f6fc] flex items-center gap-1.5 bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] px-2.5 py-1 rounded-md transition-all font-mono"
            >
              Repository <ArrowUpRight className="w-3 h-3 text-[#8b949e]" />
            </a>

            {githubUser ? (
              <div className="flex items-center gap-2 relative group">
                <img 
                  src={githubUser.avatar_url} 
                  alt={githubUser.login}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full border border-[#30363d] cursor-pointer hover:border-[#8b949e] transition-all" 
                  title={`Logged in as ${githubUser.name || githubUser.login}`}
                />
                <span className="hidden sm:inline text-xs font-mono text-[#8b949e] hover:text-[#f0f6fc] cursor-pointer font-semibold" title="Disconnect profile" onClick={handleDisconnectGithub}>
                  {githubUser.login}
                </span>
                <span className="text-[10px] text-[#f85149] hover:underline cursor-pointer hidden md:inline ml-1" onClick={handleDisconnectGithub}>
                  (Sign Out)
                </span>
              </div>
            ) : (
              <button 
                onClick={handleConnectGithub}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#238636] hover:bg-[#2ea44f] text-[#f0f6fc] border border-[#2ea44f] rounded-md text-xs font-semibold cursor-pointer transition-colors font-mono"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Connect GitHub</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. REPOSITORY SUB-HEADER (Interactive Watch / Fork / Star action panel) */}
      <div className="bg-[#161b22] border-b border-[#30363d] py-3.5 px-4 sm:px-6 select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Layers className="w-4 h-4 text-[#8b949e]" />
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono">
              <span className="text-[#2f81f7] hover:underline cursor-pointer font-medium">
                {githubUser ? githubUser.login : "guest-committer"}
              </span>
              <span className="text-[#8b949e]">/</span>
              <span className="font-bold text-[#f0f6fc] hover:underline cursor-pointer">openbridge-onboarding-hub</span>
            </div>
            <span className="px-2 py-0.2 rounded-full text-[10px] bg-[#21262d] border border-[#30363d] text-[#8b949e] font-mono font-medium">
              Public
            </span>
            <span className="px-2 py-0.2 rounded-full text-[10px] bg-[#238636]/10 border border-[#238636]/30 text-[#3fb950] font-mono font-medium flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#238636] animate-pulse"></span>
              Active fork
            </span>
          </div>

          {/* Metrics controller block with crisp styling */}
          <div className="flex items-center gap-1.5 select-none shrink-0 self-start md:self-center">
            
            <button
              onClick={() => {
                setWatched(!watched);
                setWatches(w => watched ? w - 1 : w + 1);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                watched 
                  ? "bg-[#21262d] border-[#8b949e] text-[#f0f6fc]" 
                  : "bg-[#21262d] border-[#30363d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#f0f6fc]"
              }`}
            >
              <Eye className={`w-3.5 h-3.5 ${watched ? "text-[#D29922] fill-[#D29922]" : ""}`} />
              <span>Watch</span>
              <span className="bg-[#0d1117] px-1.5 py-0.2 rounded text-[10px] text-[#8b949e] border border-[#30363d]">
                {watches}
              </span>
            </button>

            <button
              onClick={() => {
                setForked(!forked);
                setForks(f => forked ? f - 1 : f + 1);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                forked 
                  ? "bg-[#21262d] border-[#8b949e] text-[#f0f6fc]" 
                  : "bg-[#21262d] border-[#30363d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#f0f6fc]"
              }`}
            >
              <GitFork className={`w-3.5 h-3.5 ${forked ? "text-[#2f81f7]" : ""}`} />
              <span>Fork</span>
              <span className="bg-[#0d1117] px-1.5 py-0.2 rounded text-[10px] text-[#8b949e] border border-[#30363d]">
                {forks}
              </span>
            </button>

            <button
              onClick={() => {
                setStarred(!starred);
                setStars(s => starred ? s - 1 : s + 1);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                starred 
                  ? "bg-[#21262d] border-[#8b949e] text-[#f0f6fc]" 
                  : "bg-[#21262d] border-[#30363d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#f0f6fc]"
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${starred ? "text-[#D29922] fill-[#D29922]" : ""}`} />
              <span>{starred ? "Starred" : "Star"}</span>
              <span className="bg-[#0d1117] px-1.5 py-0.2 rounded text-[10px] text-[#8b949e] border border-[#30363d]">
                {stars}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. CORE TWO-COLUMN COLLABORATION WORKSPACE WORKBENCH */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        
        {apiError && (
          <div className="mb-6 bg-rose-950/20 border border-rose-900/40 rounded-lg p-4 text-rose-350 text-xs font-mono flex items-start gap-2.5 relative animate-fade-in shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1 pr-8">
              <span className="font-bold text-white block uppercase text-[10px] tracking-wider">API HANDSHAKE TELEMETRY WARNING</span>
              <p className="leading-relaxed">{apiError}</p>
            </div>
            <button 
              onClick={() => setApiError(null)} 
              className="absolute top-3 right-3 text-rose-400 hover:text-white font-bold cursor-pointer transition-colors p-1"
              title="Dismiss warning"
            >
              ✕
            </button>
          </div>
        )}

        {!profile ? (
          /* High-Fidelity GitHub styled landing and onboarding showcase */
          <div className="space-y-12 animate-fade-in">
            
            {/* 1. HERO SECTOR WITH GENTLE COSMIC ACCENT & REVOLUTIONARY GREETING */}
            <div className="relative glow-border glass-card rounded-2xl overflow-hidden py-12 px-6 sm:px-10 text-center sm:text-left shadow-2xl">
              
              {/* Starry matrix ambient lights */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#2f81f7]/15 rounded-full blur-[100px] pointer-events-none"></div>
              <div className="absolute -bottom-10 left-10 w-60 h-60 bg-[#238636]/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-8 space-y-5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#238636]/10 border border-[#238636]/30 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#238636] animate-pulse"></span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#3fb950] font-bold">
                      OpenBridge Onboarding System
                    </span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#f0f6fc] leading-tight">
                    Let's build from here. <br />
                    <span className="bg-gradient-to-r from-[#2f81f7] via-[#58a6ff] to-[#3fb950] text-transparent bg-clip-text">
                      Transition to open-source velocity.
                    </span>
                  </h1>
                  
                  <p className="text-[#8b949e] text-xs sm:text-sm leading-relaxed max-w-2.5xl">
                    OpenBridge is a custom developer workbench that pairs your personal skillset with genuine codebase requirements. Access interactive 4-week roadmap milestones, generate cryptographic commit signature keys, and map complex bug reports to logical code instructions with Gemini intelligence.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {githubUser ? (
                      <div className="inline-flex items-center gap-2 bg-[#0d1117] border border-[#30363d] px-3 py-2 rounded-lg">
                        <img src={githubUser.avatar_url} className="w-6 h-6 rounded-full border border-[#2ea44f]" referrerPolicy="no-referrer" />
                        <span className="text-xs text-[#f0f6fc] font-mono">@{githubUser.login} authenticated</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleConnectGithub}
                        className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-[#238636] hover:bg-[#2ea44f] border border-[#2ea44f] text-xs font-semibold text-white rounded-md cursor-pointer transition-all hover:scale-[1.01] shadow-lg font-mono"
                      >
                        <Github className="w-4 h-4" />
                        Connect via GitHub
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        const target = document.getElementById("profile-creation-deck");
                        target?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-4 py-2.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#8b949e] text-xs font-semibold text-[#f0f6fc] rounded-md transition-all cursor-pointer font-mono"
                    >
                      Configure Profile ↓
                    </button>
                  </div>
                </div>

                {/* Simulated interactive live workspace graph */}
                <div className="lg:col-span-4 hidden lg:block">
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 font-mono text-[10.5px] text-[#8b949e] space-y-3.5 relative shadow-inner">
                    <div className="flex items-center justify-between border-b border-[#30363d] pb-2 text-[10px] uppercase font-bold text-[#f0f6fc]">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-[#2f81f7]" />
                        openbridge-terminal
                      </span>
                      <span className="text-[#3fb950] animate-pulse">● live</span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[#3fb950]">$ openbridge status --verbose</p>
                      <p className="text-zinc-500">Initializing telemetry handshake...</p>
                      <p className="text-[#f0f6fc]">Session ID: OB_071557Z</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[#2f81f7]">$ check-auth --provider=github</p>
                      <p className="text-[#8b949e]">
                        {githubUser 
                          ? `✓ Linked ID: ${githubUser.login} (${githubUser.public_repos} rep)` 
                          : "⚠ No master token found. Interactive simulation open."}
                      </p>
                    </div>

                    <div className="space-y-1 border-t border-[#30363d]/50 pt-2.5">
                      <p className="text-[#58a6ff]">Active Onboarding Path: </p>
                      <p className="text-zinc-400">↳ 4-Week Milestone Checklists</p>
                      <p className="text-zinc-400">↳ Sandbox pre-flight GPG check</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* 2. THE CHANNELS BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
              
              <div className="glass-card rounded-xl p-5 space-y-2">
                <div className="p-2 w-max bg-[#2f81f7]/10 border border-[#2f81f7]/30 text-[#2f81f7] rounded-md">
                  <Code className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-[#f0f6fc] tracking-tight">Curated Repositories</h4>
                <p className="text-[#8b949e] text-[11px] leading-relaxed font-sans">
                  Avoid hunting for problems. We automatically query and recommendation issue indices that match your targeted skill level.
                </p>
              </div>

              <div className="glass-card rounded-xl p-5 space-y-2">
                <div className="p-2 w-max bg-[#238636]/10 border border-[#238636]/30 text-[#3fb950] rounded-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-[#f0f6fc] tracking-tight">Structured Checklists</h4>
                <p className="text-[#8b949e] text-[11px] leading-relaxed font-sans">
                  Follow a dedicated 4-week roadmap detailing code structure exploration, issue mapping, and simulated PR pipelines.
                </p>
              </div>

              <div className="glass-card rounded-xl p-5 space-y-2">
                <div className="p-2 w-max bg-[#D29922]/10 border border-[#D29922]/30 text-[#D29922] rounded-md">
                  <Shield className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-[#f0f6fc] tracking-tight">Pre-flight Verification</h4>
                <p className="text-[#8b949e] text-[11px] leading-relaxed font-sans">
                  Generate secure digital GPG signatures and evaluate open-source hygiene with interactive compliance questionnaires.
                </p>
              </div>

              <div className="glass-card rounded-xl p-5 space-y-2">
                <div className="p-2 w-max bg-[#7928ca]/10 border border-purple-900/40 text-purple-400 rounded-md">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-[#f0f6fc] tracking-tight">AI Issue Translate</h4>
                <p className="text-[#8b949e] text-[11px] leading-relaxed font-sans">
                  Feed complex maintainer bug reports directly to Gemini to get deep technical breakdowns and immediate resolution tips.
                </p>
              </div>

            </div>

            {/* 3. TWIN SPLIT CONFIGURATION AREA */}
            <div id="profile-creation-deck" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Onboarding Sidebar */}
              <div className="lg:col-span-4 bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 pb-3 border-b border-[#30363d] text-xs font-mono font-bold text-[#8b949e]">
                  <Settings className="w-4 h-4 text-[#8b949e]" />
                  <span>WORKSPACE CONTROLS</span>
                </div>
                
                <div className="space-y-3">
                  <span className="block text-[10px] uppercase font-mono tracking-wider font-bold text-[#8b949e]">
                    Configuration Progress
                  </span>
                  
                  <div className="w-full bg-[#0d1117] h-1.5 rounded-full overflow-hidden border border-[#30363d]">
                    <div className={`bg-[#238636] h-full transition-all ${githubUser ? "w-[100%]" : "w-[15%]"}`}></div>
                  </div>
                  
                  <span className="block text-[11px] text-[#8b949e] leading-relaxed">
                    {githubUser ? (
                      <span>Workstation synchronized with your verified <strong className="text-[#3fb950]">GitHub details</strong>. Adjust your language focus below to generate milestones.</span>
                    ) : (
                      <span>Profile setup is currently pending. Connect below using our direct pop-up redirect module or use the React/TS preset template.</span>
                    )}
                  </span>
                </div>

                {/* GitHub Connect Box */}
                <div className="pt-3 border-t border-[#30363d] space-y-2.5">
                  <span className="block text-[10px] font-mono text-[#8b949e] uppercase font-bold">GitHub Credentials</span>
                  {githubUser ? (
                    <div className="bg-[#0D1117] border border-[#30363d] rounded-md p-3 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <img src={githubUser.avatar_url} className="w-6 h-6 rounded-full border border-[#30363d]" referrerPolicy="no-referrer" />
                        <div className="min-w-0">
                          <span className="block text-[11px] font-bold text-[#f0f6fc] truncate">@{githubUser.login}</span>
                          <span className="block text-[9px] text-[#8b949e] font-mono">{githubUser.public_repos} repos • {githubUser.followers} followers</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-[#3fb950] font-mono flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#238636] block"></span>
                          Ready
                        </span>
                        <button onClick={handleDisconnectGithub} className="text-[#f85149] hover:underline cursor-pointer">
                          Disconnect Profile
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#0D1117] border border-[#30363d]/60 rounded-md p-3 space-y-3">
                      <span className="block text-[10px] text-[#8b949e] leading-normal font-mono">
                        Supports real GitHub authorization if client credentials exist, or interactive sandbox authorization instantly.
                      </span>
                      <button
                        onClick={handleConnectGithub}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea44f] border border-[#2ea44f] text-[11px] font-semibold text-[#ffffff] rounded-md transition-colors cursor-pointer"
                      >
                        <Github className="w-3.5 h-3.5" />
                        Connect via GitHub
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-[#30363d] space-y-2">
                  <span className="block text-[10px] font-mono text-[#8b949e] uppercase font-bold">Instant Sandbox-Preset</span>
                  <button
                    onClick={handleOnboardPreset}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono font-semibold text-[#f0f6fc] rounded-md transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#2f81f7]" />
                    Fast-Track (React & TS Setup)
                  </button>
                </div>
              </div>

              {/* Profile setup form container */}
              <div className="lg:col-span-8 space-y-6">
                <div className="glass-card rounded-xl p-6 shadow-xl">
                  <h2 className="text-lg font-semibold text-[#f0f6fc] tracking-tight mb-2">
                    Create your customized workstation profile
                  </h2>
                  <p className="text-[#8b949e] text-xs leading-relaxed max-w-2xl mb-6 font-mono">
                    OpenBridge leverages your parameters to dynamically fetch relevant codebase issues and synthesize milestones. Select your primary domain, difficulty level, and tools below:
                  </p>
                  <ProfilingForm onSubmit={handleSubmitProfile} isLoading={loading} />
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Main active platform view and tabs layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT SIDEBAR PANEL: Developer Profile summary & workspace navigation */}
            <div className="lg:col-span-3 space-y-5">
              
              {/* Profile Card Summary */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 space-y-4">
                <div className="flex items-center gap-3">
                  {githubUser ? (
                    <img 
                      src={githubUser.avatar_url} 
                      alt={githubUser.login}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full border border-[#30363d] select-none shrink-0" 
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#238636] to-emerald-500 flex items-center justify-center text-sm text-white font-bold border border-[#30363d] select-none shrink-0 font-mono">
                      GC
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="block text-xs font-mono font-bold text-[#8b949e] uppercase">
                      {githubUser?.simulated ? "Simulated Profile" : githubUser ? "Verified Account" : "GitHub Guest"}
                    </span>
                    <span className="block text-sm font-bold text-[#f0f6fc] truncate leading-tight">
                      {githubUser ? githubUser.name || githubUser.login : "guest-committer"}
                    </span>
                    <span className="block text-[10px] text-[#8b949e] mt-1 hover:text-[#2f81f7] cursor-pointer font-mono" title="Commit sign-off ID info">
                      id: {githubUser ? `GH_${githubUser.login.substring(0, 8).toUpperCase()}` : "OB_071557Z"}
                    </span>
                  </div>
                </div>

                {githubUser && (
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-2.5 space-y-1.5 text-[11px] font-mono text-[#8b949e]">
                    <div className="flex justify-between">
                      <span>Public Repos:</span>
                      <span className="text-[#f0f6fc] font-semibold">{githubUser.public_repos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Followers:</span>
                      <span className="text-[#f0f6fc] font-semibold">{githubUser.followers}</span>
                    </div>
                  </div>
                )}

                {/* Profiling specifics tags list */}
                <div className="pt-3 border-t border-[#30363d] space-y-2 text-xs">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#8b949e]">Target Domain:</span>
                    <span className="text-[#f0f6fc] font-semibold">{profile.interest}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#8b949e]">Difficulty Level:</span>
                    <span className="px-1.5 py-0.2 text-[10px] bg-[#21262d] border border-[#30363d] rounded-md text-[#f0f6fc] font-semibold">
                      {profile.level}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1.5">
                    <span className="block text-[10px] uppercase font-mono tracking-wider text-[#8b949e] font-bold">Workspace Toolset</span>
                    <div className="flex flex-wrap gap-1">
                      {profile.skills.map((s, idx) => (
                        <span key={idx} className="bg-[#0d1117] text-[#8b949e] border border-[#30363d] px-1.5 py-0.5 rounded text-[10px] font-mono leading-none">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Level chip */}
                <div className="pt-2">
                  <LevelBadge
                    completedTasks={Object.values(checkedRoadmapTasks).filter(Boolean).length}
                    mergedPRs={0}
                    variant="compact"
                  />
                </div>

                <div className="pt-3 border-t border-[#30363d] space-y-2">
                  {/* Public Profile Link */}
                  <a
                    href={`/p/${githubUser ? githubUser.login : "guest-committer"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center inline-flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold uppercase py-1.5 bg-[#21262d] hover:bg-[#2f81f7]/10 hover:text-[#2f81f7] hover:border-[#2f81f7]/30 border border-[#30363d] rounded-md transition-all cursor-pointer"
                  >
                    <User className="w-3 h-3" />
                    View Public Profile
                  </a>
                  <button
                    onClick={handleResetProfile}
                    className="w-full text-center text-[11px] font-mono font-bold uppercase py-1.5 bg-[#21262d] hover:bg-[#bd2c00]/10 hover:text-[#f85149] hover:border-[#f85149]/30 border border-[#30363d] rounded-md transition-all cursor-pointer"
                  >
                    Reset Profile Config
                  </button>
                </div>
              </div>

              {/* Sidebar Navigation controls */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden select-none">
                <div className="px-4 py-3 border-b border-[#30363d] text-[10px] font-mono uppercase tracking-wider text-[#8b949e] font-bold">
                  MENTOR INTERACTION CHANNELS
                </div>
                
                <div className="divide-y divide-[#30363d]">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`w-full text-left px-4 py-3 text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeTab === "dashboard"
                        ? "bg-[#21262d] text-[#f0f6fc] border-l-2 border-[#f78166]"
                        : "text-[#8b949e] bg-[#161b22] hover:bg-[#21262d] hover:text-[#f0f6fc]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Code className="w-4 h-4" />
                      <span>Code & Roadmap</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#0d1117] border border-[#30363d] text-[#8b949e] rounded font-bold">
                      {repos.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("challenge")}
                    className={`w-full text-left px-4 py-3 text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeTab === "challenge"
                        ? "bg-[#21262d] text-[#f0f6fc] border-l-2 border-[#f78166]"
                        : "text-[#8b949e] bg-[#161b22] hover:bg-[#21262d] hover:text-[#f0f6fc]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <GitPullRequest className="w-4 h-4" />
                      <span>Interactive PRs</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#0d1117] border border-[#30363d] text-[#8b949e] rounded font-bold uppercase">
                      Active
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("preflight")}
                    className={`w-full text-left px-4 py-3 text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeTab === "preflight"
                        ? "bg-[#21262d] text-[#f0f6fc] border-l-2 border-[#f78166]"
                        : "text-[#8b949e] bg-[#161b22] hover:bg-[#21262d] hover:text-[#f0f6fc]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4" />
                      <span>Security & Pre-flights</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  </button>

                  <button
                    onClick={() => setActiveTab("translator")}
                    className={`w-full text-left px-4 py-3 text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeTab === "translator"
                        ? "bg-[#21262d] text-[#f0f6fc] border-l-2 border-[#f78166]"
                        : "text-[#8b949e] bg-[#161b22] hover:bg-[#21262d] hover:text-[#f0f6fc]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>AI Issue Mapper</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#0d1117] border border-[#30363d] text-[#8b949e] rounded font-bold">
                      Gemini
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("programs")}
                    className={`w-full text-left px-4 py-3 text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeTab === "programs"
                        ? "bg-[#21262d] text-[#f0f6fc] border-l-2 border-[#f78166]"
                        : "text-[#8b949e] bg-[#161b22] hover:bg-[#21262d] hover:text-[#f0f6fc]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Award className="w-4 h-4" />
                      <span>Fellowships</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#0d1117] border border-[#30363d] text-[#8b949e] rounded font-bold">
                      6
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("codereview")}
                    className={`w-full text-left px-4 py-3 text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeTab === "codereview"
                        ? "bg-[#21262d] text-[#f0f6fc] border-l-2 border-violet-500"
                        : "text-[#8b949e] bg-[#161b22] hover:bg-[#21262d] hover:text-[#f0f6fc]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4" />
                      <span>Code Review</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-violet-950/40 border border-violet-900/40 text-violet-400 rounded font-bold">
                      AI
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("interview")}
                    className={`w-full text-left px-4 py-3 text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeTab === "interview"
                        ? "bg-[#21262d] text-[#f0f6fc] border-l-2 border-cyan-500"
                        : "text-[#8b949e] bg-[#161b22] hover:bg-[#21262d] hover:text-[#f0f6fc]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4" />
                      <span>Interview Prep</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-cyan-950/40 border border-cyan-900/40 text-cyan-400 rounded font-bold">
                      AI
                    </span>
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT MAIN WORKSPACE LAYER: Dynamic Tab Content */}
            <div className="lg:col-span-9 space-y-6">
              
              {activeTab === "dashboard" && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* File tree browser explorer */}
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#30363d]">
                      <Terminal className="w-4 h-4 text-[#8b949e]" />
                      <span className="text-xs font-mono font-bold text-[#f0f6fc]">ACTIVE WORKBENCH REPOSITORY TREE</span>
                    </div>
                    <GithubFileExplorer />
                  </div>

                  {/* Contribution Streak Heatmap */}
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                    <StreakHeatmap refreshKey={activityRefresh} />
                  </div>

                  {/* Curated Repo Recommendations */}
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                    {loading ? (
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-[#30363d] rounded w-1/4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
                          <div className="h-32 bg-[#30363d]/50 rounded"></div>
                          <div className="h-32 bg-[#30363d]/50 rounded"></div>
                          <div className="h-32 bg-[#30363d]/50 rounded"></div>
                        </div>
                      </div>
                    ) : (
                      <RepoRecommender repos={repos} userProfile={profile} onReset={handleResetProfile} />
                    )}
                  </div>

                  {/* Customized roadmap checklist */}
                  {roadmap && (
                    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                      {loading ? (
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-[#30363d] rounded w-1/3"></div>
                          <div className="h-24 bg-[#30363d]/50 rounded"></div>
                        </div>
                      ) : (
                        <ContributionRoadmap 
                          roadmap={roadmap} 
                          checkedTasks={checkedRoadmapTasks} 
                          onToggleTask={handleToggleRoadmapTask} 
                          login={githubUser ? githubUser.login : "guest-committer"}
                        />
                      )}
                    </div>
                  )}

                </div>
              )}

              {activeTab === "challenge" && (
                <div className="animate-fade-in bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  {roadmap && (
                     <ChallengeHub 
                       roadmap={roadmap} 
                       checkedTasks={checkedRoadmapTasks} 
                       onToggleTask={handleToggleRoadmapTask} 
                       profile={profile}
                       githubUser={githubUser}
                       initialPullRequests={pullRequests}
                     />
                  )}
                </div>
              )}

              {activeTab === "preflight" && (
                <div className="animate-fade-in bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <PreflightConsole />
                </div>
              )}

              {activeTab === "translator" && (
                <div className="animate-fade-in bg-[#161b22] border border-[#30363d] rounded-lg p-5 font-sans">
                  <IssueTranslator onTranslate={handleTranslateIssue} />
                </div>
              )}

              {activeTab === "programs" && (
                <div className="animate-fade-in bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <OpportunityLayer />
                </div>
              )}

              {activeTab === "codereview" && (
                <div className="animate-fade-in bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <CodeReview />
                </div>
              )}

              {activeTab === "interview" && (
                <div className="animate-fade-in bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <MockInterview profile={profile} />
                </div>
              )}

            </div>

          </div>
        )}

        {/* 4. FOOTER REGION */}
        <footer className="border-t border-[#30363d] pt-6 mt-12 text-[#8b949e] text-[11px] text-center space-y-2 font-mono select-none">
          <p>© 2026 OpenBridge. Designed as a native developer tool inspired by open-source telemetry workflows.</p>
          <div className="flex items-center justify-center gap-4 text-[10px]">
            <a href="https://github.com/opensource/code-of-conduct" target="_blank" rel="noreferrer" className="hover:text-[#2f81f7] transition-colors">Contributor Covenant</a>
            <span>•</span>
            <a href="https://opensource.org" target="_blank" rel="noreferrer" className="hover:text-[#2f81f7] font-medium transition-colors font-semibold">OSI Framework Parity</a>
          </div>
        </footer>

      </main>
    </div>
  );
}
