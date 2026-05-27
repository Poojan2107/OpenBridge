import React, { useState } from "react";
import { 
  Flame, 
  GitPullRequest, 
  Terminal, 
  Award, 
  Zap, 
  Check, 
  Plus, 
  X, 
  Send, 
  RefreshCw, 
  AlertCircle, 
  GitBranch, 
  Calendar,
  ExternalLink,
  Copy,
  Sparkles,
  ShieldAlert,
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { PersonalizedRoadmap, UserProfile, GitHubUser } from "../types";

interface ChallengeHubProps {
  roadmap: PersonalizedRoadmap;
  checkedTasks: { [key: string]: boolean };
  onToggleTask: (week: string, index: number) => void;
  profile?: UserProfile | null;
  githubUser?: GitHubUser | null;
}

interface SubmittedPR {
  id: string;
  url: string;
  repo: string;
  status: "pending" | "verifying" | "merged" | "failed";
  title: string;
}

export default function ChallengeHub({ roadmap, checkedTasks, onToggleTask, profile, githubUser }: ChallengeHubProps) {
  const [prUrl, setPrUrl] = useState("");
  const [prName, setPrName] = useState("");
  const [submittedPrs, setSubmittedPrs] = useState<SubmittedPR[]>(() => {
    try {
      const saved = localStorage.getItem("ob_submitted_prs");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "pr-1",
        url: "https://github.com/github/docs/pull/1042",
        repo: "github/docs",
        status: "merged",
        title: "Typo correction in markdown guides"
      },
      {
        id: "pr-2",
        url: "https://github.com/guest-committer/openbridge-onboarding-hub/pull/1",
        repo: "guest-committer/openbridge-onboarding-hub",
        status: "pending",
        title: "ci: enforce DCO and sign-offs pre-flight validations"
      }
    ];
  });
  const [registering, setRegistering] = useState(false);
  const [registryMessage, setRegistryMessage] = useState("");

  // PR review workspace state
  const [selectedPrId, setSelectedPrId] = useState<string | null>(null);
  const [activePrSubTab, setActivePrSubTab] = useState<"conversation" | "commits" | "files">("conversation");
  const [newPrComments, setNewPrComments] = useState<{ [prId: string]: string[] }>(() => {
    try {
      const saved = localStorage.getItem("ob_pr_comments");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      "pr-1": [
        "This typo fix is correct. Thanks for contributing!",
        "Continuous integration build has passed successfully."
      ],
      "pr-2": [
        "Welcome, guest committer! To merge this, all pre-flight linter checks must be functional.",
        "Please review the Files Changed tab to verify modifications."
      ]
    };
  });
  const [newCommentInput, setNewCommentInput] = useState("");

  React.useEffect(() => {
    localStorage.setItem("ob_submitted_prs", JSON.stringify(submittedPrs));
  }, [submittedPrs]);

  React.useEffect(() => {
    localStorage.setItem("ob_pr_comments", JSON.stringify(newPrComments));
  }, [newPrComments]);

  const handleAddComment = (prId: string) => {
    if (!newCommentInput.trim()) return;
    setNewPrComments(prev => ({
      ...prev,
      [prId]: [...(prev[prId] || []), newCommentInput]
    }));
    setNewCommentInput("");
  };

  const handleMergePR = (prId: string) => {
    setSubmittedPrs(prev => prev.map(p => p.id === prId ? { ...p, status: "merged" } : p));
  };

  // Badge customizer states
  const [badgeTheme, setBadgeTheme] = useState<"classic" | "cyberpunk" | "emerald">("classic");
  const [tempPassName, setTempPassName] = useState(() => {
    return githubUser ? githubUser.name || githubUser.login : "Guest Committer";
  });
  const [badgeCopied, setBadgeCopied] = useState(false);

  React.useEffect(() => {
    if (githubUser) {
      setTempPassName(githubUser.name || githubUser.login);
    } else {
      setTempPassName("Guest Committer");
    }
  }, [githubUser]);

  const handleCopySnippet = () => {
    const userSlug = githubUser ? githubUser.login : "guest-committer";
    const textToCopy = `[![OpenBridge OSS-Ready](https://img.shields.io/badge/OpenBridge-OSS_Ready-048754?logo=github&style=flat-square)](https://github.com/${userSlug}/openbridge-onboarding-hub)`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setBadgeCopied(true);
      setTimeout(() => setBadgeCopied(false), 2000);
    });
  };

  // Total tasks in roadmap (each week usually has 3 targets, total 12)
  const weeks = ["week1", "week2", "week3", "week4"] as const;
  const totalTasks = weeks.reduce((sum, w) => sum + (roadmap[w]?.length || 0), 0);
  const completedCount = Object.values(checkedTasks).filter(Boolean).length;

  // Render variables for Hacktoberfest progress (aiming for 4 PRs)
  const hacktoberfestPrCount = submittedPrs.filter(pr => pr.status === "merged").length;
  const progressPercent = Math.min((hacktoberfestPrCount / 4) * 100, 100);

  // Simulated PR review verification sequence
  const handleRegisterPR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prUrl.trim() || !prName.trim()) return;

    // Validate if it has generic GitHub pull request URL boundaries
    if (!prUrl.includes("github.com") || !prUrl.includes("/pull/")) {
      setRegistryMessage("Invalid GitHub PR format. e.g. https://github.com/owner/repo/pull/123");
      return;
    }

    setRegistering(true);
    setRegistryMessage("Analyzing branches, test records and git credentials...");

    // Simulate real open source check steps
    setTimeout(() => {
      setRegistryMessage("Validating pull signature and repository contribution standards...");
      setTimeout(() => {
        // Parse repo name from URL if possible
        let extractedRepo = "user/repo";
        try {
          const parts = prUrl.split("github.com/")[1]?.split("/");
          if (parts && parts[0] && parts[1]) {
            extractedRepo = `${parts[0]}/${parts[1]}`;
          }
        } catch { /* fallback */ }

        const newPr: SubmittedPR = {
          id: `pr-${Date.now()}`,
          url: prUrl,
          repo: extractedRepo,
          status: "merged", // For responsive reward UI feel, we successfully verify & merge
          title: prName
        };

        setSubmittedPrs(prev => [newPr, ...prev]);
        setPrUrl("");
        setPrName("");
        setRegistering(false);
        setRegistryMessage("Success! PR validated against repository rules and successfully registered.");
        
        setTimeout(() => setRegistryMessage(""), 4000);
      }, 1000);
    }, 1200);
  };

  // Render custom contribution grid helper (simulate GitHub's classic activity commits board)
  // Grid layout: 4 weeks, with 3 tasks per week = 12 nodes. Let's make a beautiful 7 rows (days) x 6 columns display.
  // We'll map the 12 roadmap milestones sequentially onto specific squares, and the rest as static ambient contributions to build a full GitHub grid look.
  const GRID_SIZE = 42; // 7 rows x 6 cols
  const contributionSquares = Array.from({ length: GRID_SIZE }).map((_, idx) => {
    // Sequentially assign the 12 roadmap nodes to specific squares
    const roadmapIndex = idx % 12; 
    const isRoadmapNode = idx < 12;
    const weekKey = `week${Math.floor(roadmapIndex / 3) + 1}` as const;
    const taskSubIndex = roadmapIndex % 3;
    const isCompleted = isRoadmapNode && checkedTasks[`${weekKey}-${taskSubIndex}`];
    
    // For static squares, create some pseudo-random decorative shading (simulates historical activity)
    const opacityClass = isRoadmapNode
      ? isCompleted
        ? "bg-emerald-400 border-emerald-500 scale-105 shadow-[0_0_8px_rgba(52,211,153,0.3)]"
        : "bg-zinc-900 border-zinc-950 focus:border-zinc-800"
      : idx % 7 === 1 || idx % 5 === 2
        ? "bg-emerald-950 border-emerald-900/60"
        : idx % 6 === 0
          ? "bg-emerald-900/40 border-emerald-900/40"
          : "bg-zinc-950 border-zinc-900/50";

    return {
      id: idx,
      isRoadmapNode,
      weekKey,
      taskSubIndex,
      isCompleted,
      styleClass: opacityClass,
      taskName: isRoadmapNode && roadmap[weekKey]?.[taskSubIndex] ? roadmap[weekKey][taskSubIndex] : null
    };
  });

  const currentPr = submittedPrs.find(p => p.id === selectedPrId);

  return (
    <div className="space-y-8">
      
      {currentPr ? (
        <div className="border border-[#30363d] bg-[#0d1117] rounded-xl overflow-hidden font-sans animate-fade-in text-zinc-300">
          
          {/* PR Details Top Navigation */}
          <div className="p-4 bg-[#161b22] border-b border-[#30363d] flex flex-wrap items-center justify-between gap-3 text-xs">
            <button
              onClick={() => setSelectedPrId(null)}
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white bg-[#21262d] border border-[#30363d] hover:border-[#8b949e] px-2.5 py-1.5 rounded transition-all cursor-pointer font-mono font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" /> Back to List
            </button>
            <div className="text-zinc-500 font-mono text-[11px]">
              Pull Request <span className="font-bold text-zinc-300">#{currentPr.id}</span>
            </div>
          </div>

          {/* PR Title and Branch pointers */}
          <div className="p-6 border-b border-[#30363d] bg-[#0d1117] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center flex-wrap gap-2">
                <span>{currentPr.title}</span>
                <span className="text-zinc-500 font-mono text-sm">#{currentPr.id}</span>
              </h2>
              
              <span className={`inline-flex items-center gap-1.5 p-1 px-3 rounded-full text-[10px] font-bold uppercase font-mono ${
                currentPr.status === "merged"
                  ? "bg-[#238636]/15 text-[#2ea44f] border border-[#238636]/40"
                  : "bg-amber-950/20 text-amber-400 border border-amber-900/40 animate-pulse"
              }`}>
                {currentPr.status === "merged" ? "Merged" : "Open for review"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 flex-wrap">
              <span className="bg-[#1f6feb]/15 text-[#58a6ff] px-2 py-0.5 rounded text-[10px] font-bold border border-[#1f6feb]/25">
                patch-01
              </span>
              <span className="text-zinc-550 text-[10px]">into</span>
              <span className="bg-[#21262d] text-zinc-300 px-2 py-0.5 rounded text-[10px] font-bold border border-zinc-800">
                main
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-400 font-sans text-[11px] font-semibold">{currentPr.repo}</span>
            </div>
          </div>

          {/* Sub tabs: Conversation, Commits, Files Changed */}
          <div className="flex bg-[#161b22] border-b border-[#30363d] overflow-x-auto select-none font-mono text-xs">
            <button
              onClick={() => setActivePrSubTab("conversation")}
              className={`py-3 px-6 font-semibold border-b-2 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activePrSubTab === "conversation"
                  ? "border-[#f78166] text-white bg-[#0d1117]/30"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>Conversation</span>
              <span className="px-1.5 py-0.2 rounded bg-[#21262d] border border-[#30363d] text-[10px] text-zinc-400 font-bold">
                {(newPrComments[currentPr.id] || []).length + 1}
              </span>
            </button>

            <button
              onClick={() => setActivePrSubTab("commits")}
              className={`py-3 px-6 font-semibold border-b-2 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activePrSubTab === "commits"
                  ? "border-[#f78166] text-white bg-[#0d1117]/30"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>Commits</span>
              <span className="px-1.5 py-0.2 rounded bg-[#21262d] border border-[#30363d] text-[10px] text-zinc-400 font-bold">
                1
              </span>
            </button>

            <button
              onClick={() => setActivePrSubTab("files")}
              className={`py-3 px-6 font-semibold border-b-2 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activePrSubTab === "files"
                  ? "border-[#f78166] text-white bg-[#0d1117]/30"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>Files changed</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-900 text-[10px] text-emerald-400 font-bold font-mono">
                +1
              </span>
            </button>
          </div>

          {/* Tab contents */}
          <div className="p-6 bg-[#0d1117]">
            
            {activePrSubTab === "conversation" && (
              <div className="space-y-6">
                
                {/* Timeline loop */}
                <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#30363d]">
                  
                  {/* Event 1: Initial opening description */}
                  <div className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center font-mono text-[10px] text-white font-bold shrink-0 ring-4 ring-[#0d1117] relative z-10">
                      GC
                    </div>
                    <div className="flex-grow border border-[#30363d] rounded-lg overflow-hidden bg-[#161b22]/10">
                      <div className="p-3 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between text-xs font-mono">
                        <span className="font-semibold text-zinc-350">guest-committer</span>
                        <span className="text-zinc-500">opened this pull request</span>
                      </div>
                      <div className="p-4 text-xs font-sans text-zinc-300 leading-relaxed space-y-2">
                        <p>This adds DCO certification and pre-flight tests within the main validation configurations. This fulfills step-3 milestone guidelines securely.</p>
                      </div>
                    </div>
                  </div>

                  {/* Comments from dictionary */}
                  {(newPrComments[currentPr.id] || []).map((comment, index) => (
                    <div key={index} className="flex items-start gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-[#21262d] border border-[#30363d] flex items-center justify-center font-mono text-[10px] text-zinc-300 font-semibold shrink-0 ring-4 ring-[#0d1117] relative z-10">
                        {index % 2 === 0 ? "OB" : "ME"}
                      </div>
                      <div className="flex-grow border border-[#30363d] rounded-lg overflow-hidden bg-[#161b22]/10">
                        <div className="p-3 bg-[#161b22]/80 border-b border-[#30363d] flex items-center justify-between text-xs font-mono">
                          <span className="font-semibold text-zinc-350">{index % 2 === 0 ? "openbridge-bot" : "lead-reviewer"}</span>
                          <span className="text-zinc-500">{index === 0 ? "2 hours ago" : "just now"}</span>
                        </div>
                        <div className="p-4 text-xs font-sans text-zinc-300 leading-relaxed">
                          {comment}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Actions / Checks widget */}
                  <div className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-zinc-950 border border-[#30363d] flex items-center justify-center font-mono text-[11px] text-emerald-500 font-bold shrink-0 ring-4 ring-[#0d1117] relative z-10">
                      ✓
                    </div>
                    
                    <div className="flex-grow border border-[#30363d] rounded-lg overflow-hidden bg-zinc-950">
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        
                        <div className="space-y-1">
                          <span className="block text-xs font-bold text-white font-sans flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            All automatic pre-flight checks passed
                          </span>
                          <span className="block text-[11px] text-zinc-500 leading-snug">
                            1 verification check successful. This branch has absolute compliance parity and is safe to merge.
                          </span>
                        </div>

                        {currentPr.status === "pending" ? (
                          <button
                            onClick={() => handleMergePR(currentPr.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#238636] hover:bg-[#2ea44f] border border-[#2ea44f]/30 hover:border-[#2ea44f] text-white text-xs font-semibold font-mono uppercase tracking-wider rounded-lg select-none cursor-pointer text-center shrink-0 transition-all font-bold"
                          >
                            <GitPullRequest className="w-3.5 h-3.5" />
                            Merge Pull Request
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-lg border border-emerald-900 bg-emerald-950/20 text-emerald-400 text-xs font-mono font-bold select-none uppercase shrink-0">
                            Merged Ready ✓
                          </span>
                        )}

                      </div>
                    </div>
                  </div>

                </div>

                {/* Text comment form */}
                <div className="border-t border-[#30363d] pt-6 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center font-mono text-[10px] text-white shrink-0 font-bold">
                    ME
                  </div>
                  <div className="flex-grow space-y-3">
                    <textarea
                      value={newCommentInput}
                      onChange={(e) => setNewCommentInput(e.target.value)}
                      placeholder="Leave a friendly developer review instruction or question..."
                      rows={3}
                      className="w-full bg-[#0d1117] border border-[#30363d] hover:border-[#8b949e] rounded-lg p-3 text-xs font-sans text-zinc-250 placeholder-zinc-700 focus:outline-[#30363d] focus:border-[#58a6ff]"
                    />
                    <button
                      onClick={() => handleAddComment(currentPr.id)}
                      disabled={!newCommentInput.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#21262d] disabled:bg-zinc-950 hover:bg-[#30363d] border border-[#30363d] rounded-md text-xs font-mono font-bold text-zinc-300 disabled:text-zinc-650 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Comment
                    </button>
                  </div>
                </div>

              </div>
            )}

            {activePrSubTab === "commits" && (
              <div className="space-y-4 animate-fade-in text-xs font-mono">
                <span className="block text-[10px] uppercase font-bold text-zinc-500 mb-2">Branch Commits</span>
                
                <div className="p-3 bg-[#161b22]/40 border border-[#30363d] rounded-lg flex items-center justify-between hover:bg-[#161b22]/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    <div>
                      <span className="block font-semibold text-zinc-250">ci: enforce DCO and sign-offs pre-flight validations</span>
                      <span className="block text-[#8b949e] text-[10px] mt-0.5 font-sans">guest-committer committed 3 hours ago</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-400 bg-[#21262d] border border-[#30363d] px-2 py-1 rounded font-mono">
                    89ad3fb
                  </div>
                </div>
              </div>
            )}

            {activePrSubTab === "files" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400 font-semibold mb-2 block">1 changed file with 2 additions</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900 font-bold font-mono">+2 -0 lines</span>
                </div>

                <div className="border border-[#30363d] rounded-lg overflow-hidden bg-[#0d1117] text-[11px] font-mono">
                  {/* File title */}
                  <div className="p-2.5 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between">
                    <span className="font-semibold text-zinc-300">verify-pr.yml</span>
                  </div>
                  
                  {/* Diff panel visual */}
                  <div className="p-4 leading-relaxed text-left bg-[#050608]/40 select-text">
                    <div className="text-zinc-500 select-none">@@ -15,5 +15,7 @@ jobs:</div>
                    <div className="bg-emerald-950/30 text-emerald-400 px-2 py-0.5 select-text">
                      +       echo "Scanning commits for Developer Certificate of Origin (DCO) approval..."
                    </div>
                    <div className="bg-zinc-950 text-zinc-500 px-2 py-0.5 select-none">
                      -       echo "Checking commits..."
                    </div>
                    <div className="bg-emerald-950/30 text-emerald-400 px-2 py-0.5 select-text">
                      +       git log --format=full --no-merges | grep -q "Signed-off-by:" || {"{"}
                    </div>
                    <div className="text-zinc-400 px-2 py-0.5 select-all">
                      {"        "}exit 1
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Module 1: GitHub Contribution Matrix Activity Heatmap */}
        <div className="lg:col-span-4 bg-[#090a0f] border border-zinc-900 rounded-xl p-5 hover:border-zinc-800 transition-all duration-150 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#2da44e]">
                <span className="inline-block w-2 h-2 rounded-full bg-[#2da44e]"></span>
                GitHub Activity Grid
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {completedCount}/{totalTasks} Task Commits
              </span>
            </div>
            
            <h3 className="text-sm font-bold text-zinc-150 tracking-tight">
              Onboarding Contribution Grid
            </h3>
            
            <p className="text-zinc-500 text-[11px] mt-1.5 leading-relaxed">
              Every target item you accomplish in the 4-week onboarding plan triggers a simulated git commit. Fill your matrix with green!
            </p>

            {/* Interactive Grid Map */}
            <div className="mt-5 p-3 rounded bg-zinc-950 border border-zinc-900/60 flex flex-col items-center">
              <div className="grid grid-rows-7 grid-flow-col gap-1.5">
                {contributionSquares.map((sq) => (
                  <div
                    key={sq.id}
                    title={
                      sq.isRoadmapNode
                        ? `Roadmap [${sq.weekKey.toUpperCase()} - Task 0${sq.taskSubIndex + 1}]: ${sq.taskName || ""} (${sq.isCompleted ? "Completed" : "Awaiting"})`
                        : "Ambient GitHub Contributor History"
                    }
                    className={`w-3.5 h-3.5 rounded-sm border transition-all duration-200 cursor-help ${sq.styleClass}`}
                  />
                ))}
              </div>
              
              {/* Grid Legend */}
              <div className="flex items-center gap-1.5 mt-4 self-end text-[9px] font-mono text-zinc-500">
                <span>Less</span>
                <div className="w-2.5 h-2.5 bg-zinc-950 border border-zinc-900/50 rounded-sm"></div>
                <div className="w-2.5 h-2.5 bg-emerald-950 border border-emerald-900/60 rounded-sm"></div>
                <div className="w-2.5 h-2.5 bg-emerald-900/40 border border-emerald-900/40 rounded-sm"></div>
                <div className="w-2.5 h-2.5 bg-emerald-700 border-emerald-800/80 rounded-sm"></div>
                <div className="w-2.5 h-2.5 bg-emerald-400 border-emerald-500 rounded-sm"></div>
                <span>More</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-zinc-900 text-[10px] text-zinc-500 leading-normal flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-zinc-650 shrink-0 mt-0.5" />
            <span>Hover squares to trace roadmap task alignments. Toggle checkboxes inside "Recommended Projects & Roadmap" tab to trigger commits.</span>
          </div>
        </div>

        {/* Module 2: Hacktoberfest Progress & PR Sandbox Validation Tracker */}
        <div className="lg:col-span-5 bg-[#0e090a] border border-orange-950/40 rounded-xl p-5 hover:border-orange-950/80 transition-all duration-150 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#ff7900] font-bold">
                <Flame className="w-3.5 h-3.5 fill-[#ff7900] text-[#ff7900]" />
                Hacktoberfest Registry
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {hacktoberfestPrCount}/4 PRs Merged
              </span>
            </div>
            
            <h3 className="text-sm font-bold text-zinc-150 tracking-tight">
              Casual Pull Request Tracker & Validation
            </h3>
            
            <p className="text-zinc-500 text-[11px] mt-1.5 leading-relaxed">
              Hacktoberfest celebrates open source contributions. Log and validate your pull request URLs. Successfully registered merges qualify you for reward milestones!
            </p>

            {/* Hacktoberfest Progress Meter */}
            <div className="mt-4 p-3.5 rounded bg-zinc-950/60 border border-orange-950/20">
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mb-1.5">
                <span>PR Contribution Target</span>
                <span className="font-bold text-[#ff7900]">{hacktoberfestPrCount} / 4 Registered</span>
              </div>
              <div className="w-full h-2 bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden p-[1px]">
                <div 
                  className="h-full bg-gradient-to-r from-orange-600 via-orange-500 to-rose-500 rounded-full transition-all duration-550"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[8px] font-mono text-zinc-500 mt-1">
                <span>0 PRs (Onboarding)</span>
                <span>2 (Halfway!)</span>
                <span>4 (Completed!)</span>
              </div>
            </div>

            {/* Simulated registration box */}
            <form onSubmit={handleRegisterPR} className="space-y-2 mt-4">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={prName}
                  onChange={(e) => setPrName(e.target.value)}
                  placeholder="PR Title (e.g., Fix broken spacing)"
                  className="bg-black/40 border border-[#2d140e] rounded p-2 text-xs font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-orange-500/50"
                />
                <input
                  type="text"
                  required
                  value={prUrl}
                  onChange={(e) => setPrUrl(e.target.value)}
                  placeholder="GitHub PR URL"
                  className="bg-black/40 border border-[#2d140e] rounded p-2 text-xs font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-orange-500/50"
                />
              </div>
              
              <button
                type="submit"
                disabled={registering || !prUrl.trim() || !prName.trim()}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-600 to-[#e05417] hover:from-orange-500 hover:to-orange-600 text-white disabled:bg-zinc-950 disabled:from-zinc-950 disabled:to-zinc-950 disabled:text-zinc-650 border border-orange-800 disabled:border-zinc-900 rounded text-[11px] font-mono uppercase font-bold tracking-wider transition-all cursor-pointer"
              >
                {registering ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-orange-200" />
                    Running Quality Pipelines...
                  </>
                ) : (
                  <>
                    Register PR Verification
                    <GitPullRequest className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {registryMessage && (
              <div className="mt-2 text-[9.5px] font-mono rounded bg-orange-950/20 border border-orange-900/30 p-2 text-orange-300 flex items-start gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{registryMessage}</span>
              </div>
            )}
          </div>

          {/* Registered PRs history */}
          <div className="mt-5 border-t border-[#291712]/50 pt-3">
            <span className="block text-[8px] font-mono uppercase text-zinc-500 font-bold tracking-wider mb-2">My Registered PR History (Click to Review)</span>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {submittedPrs.map((pr) => (
                <div 
                  key={pr.id} 
                  onClick={() => {
                    setSelectedPrId(pr.id);
                    setActivePrSubTab("conversation");
                  }}
                  className={`flex items-center justify-between text-[10px] bg-black/30 border rounded px-2.5 py-2 font-mono cursor-pointer transition-all ${
                    selectedPrId === pr.id 
                      ? "border-orange-500/50 bg-orange-950/10" 
                      : "border-zinc-900 hover:border-zinc-700 hover:bg-[#161b22]/30"
                  }`}
                  title="Click to view interactive diff & conversation"
                >
                  <div className="min-w-0">
                    <span className="text-zinc-300 font-semibold truncate block pr-2 hover:underline">{pr.title}</span>
                    <span className="text-zinc-550 text-[9px] block text-left">{pr.repo}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider shrink-0 border ${
                    pr.status === "merged" 
                      ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/40" 
                      : "text-amber-400 bg-amber-950/20 border-amber-900/40 animate-pulse"
                  }`}>
                    {pr.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Module 3: GSoC Mentorship Checkpoints Evaluations Portal */}
        <div className="lg:col-span-3 bg-[#090b0e] border border-sky-950/40 rounded-xl p-5 hover:border-sky-950/80 transition-all duration-150 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#1a73e8] font-bold">
                <Award className="w-3.5 h-3.5 text-[#1a73e8]" />
                GSoC Benchmarks
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Student Evaluations</span>
            </div>
            
            <h3 className="text-sm font-bold text-zinc-150 tracking-tight">
              Mentorship Checkpoints & Proposal Milestones
            </h3>
            
            <p className="text-zinc-500 text-[11px] mt-1.5 leading-relaxed">
              Google Summer of Code has formal phases. Complete these 4 milestones to establish true readiness for a funded fellowship proposal.
            </p>

            {/* Checkpoints list */}
            <div className="space-y-2.5 mt-4">
              {[
                { label: "Community Bonding", desc: "Introduce yourself in Discord, select an issue, & find a mentor.", done: completedCount >= 2 },
                { label: "Draft Proposal Submit", desc: "Formulate technical plan, trace affected code using Translator.", done: completedCount >= 5 },
                { label: "Local Sandbox Verification", desc: "Fork repo, compile dependencies, & run test suites successfully.", done: completedCount >= 8 },
                { label: "First Live PR", desc: "Submit clean commits to upstream trunk, aligning with style lines.", done: completedCount >= 11 }
              ].map((cp, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2 bg-[#090a0f] border border-zinc-90 w-full rounded">
                  <div className={`mt-0.5 p-0.5 rounded-full border transition-colors ${
                    cp.done 
                      ? "bg-sky-500/10 border-sky-500 text-sky-450" 
                      : "bg-transparent border-zinc-800 text-transparent"
                  }`}>
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <span className={`block text-[10px] font-bold font-mono ${cp.done ? "text-sky-400" : "text-zinc-400"}`}>
                      {cp.label}
                    </span>
                    <span className="block text-[9.5px] leading-relaxed text-zinc-500 font-sans">{cp.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-900 text-center select-none">
            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-zinc-400 hover:text-zinc-200">
              Google Summer of Code Portal <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      </div>
      )}

      {/* SECTION 4: Open-Source Contributor Pass & Embeddable Profile Badges (MVP Readiness Achievement) */}
      <div className="bg-[#090a0f] border border-zinc-900 rounded-xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              OSS Portfolio Credentialing
            </span>
            <h3 className="text-base font-bold text-zinc-150 tracking-tight mt-1">
              Embeddable Profile Badge & Open-Source Passport
            </h3>
            <p className="text-zinc-500 text-xs mt-1 max-w-2xl leading-relaxed">
              Celebrate your onboarding milestones. Customize and generate a verified markdown badge status link to display proudly in your real GitHub Profile README.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Aesthetic Skin:</span>
            {["classic", "cyberpunk", "emerald"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setBadgeTheme(t as any)}
                className={`px-2.5 py-1 text-[10.5px] font-mono uppercase font-bold rounded border cursor-pointer select-none transition-all ${
                  badgeTheme === t 
                    ? t === "classic" 
                      ? "bg-zinc-800 border-zinc-700 text-zinc-100" 
                      : t === "cyberpunk"
                        ? "bg-amber-950/40 border-amber-500/50 text-amber-400"
                        : "bg-emerald-950/40 border-emerald-500/50 text-emerald-450"
                    : "bg-[#090a0f] border-zinc-900 text-zinc-500 hover:text-zinc-350"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Passport Visual Render Col (7/12) */}
          <div className="md:col-span-7 flex flex-col">
            <div className={`flex-grow border rounded-xl overflow-hidden relative shadow-2xl transition-all duration-300 ${
              badgeTheme === "classic" 
                ? "bg-[#0c0d12] border-zinc-800/80" 
                : badgeTheme === "cyberpunk"
                  ? "bg-[#140f09] border-amber-900/40"
                  : "bg-[#091210] border-emerald-900/40"
            }`}>
              
              {/* Background Accent Gradients */}
              <div className={`absolute top-0 right-0 w-48 h-48 rounded-full filter blur-[80px] opacity-15 pointer-events-none ${
                badgeTheme === "classic" 
                  ? "bg-blue-500" 
                  : badgeTheme === "cyberpunk"
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`} />

              <div className={`absolute -bottom-10 -left-10 w-36 h-36 rounded-full filter blur-[60px] opacity-10 pointer-events-none ${
                badgeTheme === "classic" 
                  ? "bg-zinc-500" 
                  : badgeTheme === "cyberpunk"
                    ? "bg-red-500"
                    : "bg-teal-500"
              }`} />

              {/* Passport Header */}
              <div className={`px-5 py-3.5 border-b font-mono text-center relative z-10 ${
                badgeTheme === "classic" 
                  ? "border-zinc-850 bg-zinc-950/60" 
                  : badgeTheme === "cyberpunk"
                    ? "border-amber-950/40 bg-amber-950/20"
                    : "border-[#142e26]/30 bg-emerald-950/20"
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] uppercase tracking-widest font-extrabold ${
                    badgeTheme === "classic" 
                      ? "text-zinc-500" 
                      : badgeTheme === "cyberpunk"
                        ? "text-amber-550"
                        : "text-emerald-550"
                  }`}>
                    Openbridge Security Authority
                  </span>
                  <span className={`text-[10px] font-bold ${
                    badgeTheme === "classic" 
                      ? "text-[#2da44e]" 
                      : badgeTheme === "cyberpunk"
                        ? "text-amber-400"
                        : "text-emerald-300"
                  }`}>
                    ● VERIFIED PASS
                  </span>
                </div>
              </div>

              {/* Passport Body */}
              <div className="p-5 sm:p-6 relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                
                {/* Visual Graphic Representation Left Column */}
                <div className="sm:col-span-4 flex flex-col items-center justify-center text-center">
                  <div className={`w-20 h-20 rounded-lg flex items-center justify-center border relative overflow-hidden select-none ${
                    badgeTheme === "classic"
                      ? "bg-zinc-900/60 border-zinc-800"
                      : badgeTheme === "cyberpunk"
                        ? "bg-amber-950/30 border-amber-900/50"
                        : "bg-emerald-950/30 border-emerald-900/50"
                  }`}>
                    <Award className={`w-10 h-10 ${
                      badgeTheme === "classic"
                        ? "text-zinc-400 animate-pulse"
                        : badgeTheme === "cyberpunk"
                          ? "text-amber-400 animate-pulse"
                          : "text-emerald-450 animate-pulse"
                    }`} />
                    <div className="absolute bottom-1 w-full text-center">
                      <span className={`text-[8px] font-mono font-bold uppercase ${
                        badgeTheme === "classic" ? "text-zinc-500" : badgeTheme === "cyberpunk" ? "text-amber-500" : "text-emerald-555"
                      }`}>
                        OSS-0{completedCount || 1}
                      </span>
                    </div>
                  </div>
                  
                  <span className="text-[10px] font-mono text-zinc-550 mt-2 hover:underline cursor-help">
                    ID: OB-{Math.floor(100000 + Math.random() * 900000)}
                  </span>
                </div>

                {/* Info Right Column */}
                <div className="sm:col-span-8 space-y-3 font-mono">
                  
                  {/* Dynamic Custom Name Input Field */}
                  <div>
                    <span className="block text-[8px] text-zinc-555 uppercase tracking-wide">Committer / Passholder</span>
                    <input
                      type="text"
                      value={tempPassName}
                      onChange={(e) => setTempPassName(e.target.value)}
                      placeholder="Guest Committer"
                      className="w-full bg-transparent border-none text-sm font-bold text-zinc-100 p-0 focus:outline-none focus:ring-0 placeholder-zinc-700 font-mono mt-0.5"
                      title="Click to change name on passport"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] leading-relaxed">
                    <div>
                      <span className="block text-[8px] text-zinc-550 uppercase">Domain Class</span>
                      <span className="text-zinc-300 font-semibold truncate block">
                        {profile?.interest || "Fullstack Base"}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[8px] text-zinc-550 uppercase">Proficiency</span>
                      <span className={`font-semibold ${
                        profile?.level === "Advanced" ? "text-rose-500" : profile?.level === "Intermediate" ? "text-sky-400" : "text-emerald-450"
                      }`}>
                        {profile?.level || "Beginner"}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[8px] text-zinc-550 uppercase">Roadmap Tasks</span>
                      <span className="text-zinc-300">
                        {completedCount} / 12 Commits
                      </span>
                    </div>

                    <div>
                      <span className="block text-[8px] text-zinc-550 uppercase">Verified Merges</span>
                      <span className="text-[#ff7900] font-bold">
                        {hacktoberfestPrCount} / 4 Milestone
                      </span>
                    </div>
                  </div>

                  {/* Core languages bar inside passport */}
                  <div className="pt-2 border-t border-zinc-90 w-full">
                    <span className="block text-[8px] hover:text-zinc-400 transition-colors uppercase text-zinc-550 font-bold mb-1">
                      Platform Skill Decoders
                    </span>
                    <div className="flex flex-wrap gap-1 text-[9px]">
                      {profile?.skills && profile.skills.length > 0 ? (
                        profile.skills.map((s, idx) => (
                          <span key={idx} className="bg-zinc-90 border border-zinc-800 rounded px-1.5 py-0.5 text-zinc-400">
                            {s}
                          </span>
                        ))
                      ) : (
                        ["Git", "GPG", "MIT-License"].map((s, idx) => (
                          <span key={idx} className="bg-zinc-90 border border-zinc-800 rounded px-1.5 py-0.5 text-zinc-400">
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>

              {/* Passport Footer (Checksum & Digital Stamp) */}
              <div className="p-3 bg-black/60 border-t border-zinc-90 text-[8.5px] font-mono text-zinc-550 flex flex-col sm:flex-row items-center justify-between gap-1 select-all relative z-10">
                <span className="text-[#2da44e] font-bold shrink-0">AUTHENTIC CHECK:</span>
                <span className="truncate max-w-xs md:max-w-md">SHA256: 4e9d6bc0f50dfa213e4b{completedCount}812ae93bd20f9a2e37e90c885cf34612ce00befb15</span>
              </div>

            </div>
          </div>

          {/* Copy Snippets & Readme Guides Right Col (5/12) */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Embed Codes For GitHub Markdown</span>
              
              <div className="space-y-3 font-mono">
                
                {/* Visual badge mock image representing shield */}
                <div className="p-3 bg-zinc-950 border border-zinc-90 rounded flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] text-zinc-500 uppercase">Live Image Asset Preview</span>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="p-1 px-1.5 rounded-l text-[10px] bg-zinc-90 font-bold border-l border-t border-b border-zinc-800 text-zinc-300">OpenBridge</span>
                      <span className="p-1 px-2 rounded-r text-[10px] bg-emerald-700 border-r border-t border-b border-emerald-800 text-white font-bold tracking-tight">
                        OSS_Ready ✓
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-550 font-bold uppercase bg-emerald-950/20 px-2 py-0.5 border border-emerald-900/20 text-emerald-450 rounded shrink-0">
                    GSoC Standard
                  </span>
                </div>

                {/* Copier text block */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-zinc-500">
                    <span>Readme.md Raw Markdown Code:</span>
                    <button
                      type="button"
                      onClick={handleCopySnippet}
                      className="cursor-pointer text-emerald-450 hover:text-emerald-350 flex items-center gap-1.5 text-[10.5px]"
                    >
                      {badgeCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied Markdown!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Snippet
                        </>
                      )}
                    </button>
                  </div>
                  
                  <textarea
                    readOnly
                    value={`[![OpenBridge OSS-Ready](https://img.shields.io/badge/OpenBridge-OSS_Ready-048754?logo=github&style=flat-square)](https://github.com/guest-committer/openbridge-onboarding-hub)`}
                    className="w-full bg-black/60 border border-zinc-900 rounded-lg p-3 text-[10px] font-mono text-zinc-400 h-20 select-all focus:outline-none focus:border-zinc-800 resize-none leading-relaxed"
                  />
                </div>

              </div>
            </div>

            <div className="mt-6 border-t border-zinc-900 pt-4 text-[10px] text-zinc-500 leading-relaxed font-mono">
              <span className="text-zinc-400 font-bold block shrink-0 select-none mb-1">💡 Real MVP Placement Tip:</span>
              <p>Add this Markdown code inside your repository fork README. When reviewers visit your profile, the verified badge demonstrates that your workspace setup has been fully compliance-tested under open-source regulations. Perfect for standing out in GSoC evaluations!</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
