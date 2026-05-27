import React, { useState, useEffect, useRef } from "react";
import { UserProfile, GitHubUser } from "../types";
import ProfilingForm from "./ProfilingForm";
import { 
  Github, 
  Search, 
  ArrowRight, 
  ChevronDown, 
  Check, 
  CheckCircle, 
  MessageSquare, 
  Compass, 
  GitPullRequest, 
  Layers, 
  Shield, 
  Code, 
  Sparkles, 
  AlertCircle, 
  Terminal, 
  ArrowUpRight, 
  Star, 
  GitFork, 
  Eye, 
  BookOpen, 
  Zap, 
  Award,
  Info,
  Menu,
  X,
  ExternalLink
} from "lucide-react";

interface GithubLandingPageProps {
  githubUser: GitHubUser | null;
  onConnectGithub: () => void;
  onConnectGuest?: () => void;
  onDisconnectGithub: () => void;
  onOnboardPreset: () => void;
  onSubmitProfile: (profile: UserProfile) => void;
  isLoading: boolean;
}

// Generate an elegant, simulated 365-day grid spelling "OPENBRIDGE" for the contribution graph
const getSimulatedContributionData = () => {
  const grid: number[][] = [];
  for (let r = 0; r < 7; r++) {
    grid.push(new Array(53).fill(0));
  }

  // Letters definition matching 7-row layout
  const LETTERS: Record<string, number[][]> = {
    O: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 0, 1],
      [1, 0, 1],
      [1, 0, 1],
      [1, 0, 1],
      [1, 1, 1]
    ],
    P: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 0, 1],
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
      [1, 0, 0]
    ],
    E: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1]
    ],
    N: [
      [1, 0, 0, 1],
      [1, 1, 0, 1],
      [1, 1, 0, 1],
      [1, 0, 1, 1],
      [1, 0, 1, 1],
      [1, 0, 0, 1],
      [1, 0, 0, 1]
    ],
    B: [
      [1, 1, 0],
      [1, 0, 1],
      [1, 0, 1],
      [1, 1, 0],
      [1, 0, 1],
      [1, 0, 1],
      [1, 1, 0]
    ],
    R: [
      [1, 1, 1, 0],
      [1, 0, 0, 1],
      [1, 0, 0, 1],
      [1, 1, 1, 0],
      [1, 1, 0, 0],
      [1, 0, 1, 0],
      [1, 0, 0, 1]
    ],
    I: [
      [1, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 1]
    ],
    D: [
      [1, 1, 0],
      [1, 0, 1],
      [1, 0, 1],
      [1, 0, 1],
      [1, 0, 1],
      [1, 0, 1],
      [1, 1, 0]
    ],
    G: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
      [1, 0, 1],
      [1, 0, 1],
      [1, 1, 1]
    ]
  };

  const word = ["O", "P", "E", "N", "B", "R", "I", "D", "G", "E"];
  let colOffset = 5; // Start at column index 5 for nice center alignment

  word.forEach((char) => {
    const letterMatrix = LETTERS[char];
    if (letterMatrix) {
      const letterWidth = letterMatrix[0].length;
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < letterWidth; c++) {
          if (letterMatrix[r][c] === 1) {
            grid[r][colOffset + c] = 4; // High intensity green contribution color
          }
        }
      }
      colOffset += letterWidth + 1; // Letter width + 1 spacing column
    }
  });

  // Now, fill the remaining cells with realistic random background contributions
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 53; c++) {
      if (grid[r][c] === 0) {
        // Clear background noise directly around word's range to let letters be perfectly readable.
        // Word spans cols 5 to 45. We keep cols 4 to 46 completely clean and silent.
        const isWordColumn = c >= 4 && c <= 46;
        if (isWordColumn) {
          grid[r][c] = 0;
        } else {
          // Normal background commits outside the word area for organic styling
          const rand = Math.random();
          if (rand < 0.70) {
            grid[r][c] = 0;
          } else if (rand < 0.90) {
            grid[r][c] = 1;
          } else if (rand < 0.97) {
            grid[r][c] = 2;
          } else {
            grid[r][c] = 3;
          }
        }
      }
    }
  }

  return grid;
};

export default function GithubLandingPage({
  githubUser,
  onConnectGithub,
  onConnectGuest,
  onDisconnectGithub,
  onOnboardPreset,
  onSubmitProfile,
  isLoading
}: GithubLandingPageProps) {
  const [activeMockTab, setActiveMockTab] = useState<"recs" | "roadmap" | "issue" | "prs">("recs");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mockTranslateQuery, setMockTranslateQuery] = useState(
    "Uncaught TypeError: Cannot read properties of undefined (reading 'config') at bootstrapTelemetry (telemetry.ts:142:19)"
  );
  
  // Custom mock database states for interactive dashboard mockup
  const [mockCheckedTasks, setMockCheckedTasks] = useState<Record<string, boolean>>({
    "week1-0": true,
    "week1-1": false,
    "week2-0": false,
  });

  const [mockStarred, setMockStarred] = useState(false);
  const [mockStarCount, setMockStarCount] = useState(512);

  const contribGrid = useRef(getSimulatedContributionData());

  const handleToggleMockTask = (key: string) => {
    setMockCheckedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleScrollToSetup = () => {
    handleScrollToId("ob-setup-workstation");
  };

  const handleScrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#F0F6FC] font-sans antialiased overflow-x-hidden selection:bg-[#2F81F7]/30 selection:text-[#F0F6FC]">
      
      {/* 1. HIGH-FIDELITY GITHUB LANDING HEADER */}
      <nav id="landing-navigation" className="sticky top-0 z-50 bg-[#0D1117]/95 border-b border-[#30363D] h-16 flex items-center px-4 md:px-8 backdrop-blur-sm select-none">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          
          {/* Left section: Logo & Nav items */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <div className="w-8 h-8 rounded-lg bg-[#161B22] border border-[#30363D] flex items-center justify-center text-[#2F81F7] group-hover:border-[#8B949E] transition-colors">
                <Layers className="w-4 h-4 text-[#2F81F7] transition-transform group-hover:scale-110" />
              </div>
              <span className="font-bold text-lg text-[#F0F6FC] tracking-tight group-hover:text-[#2F81F7] transition-colors">
                OpenBridge
              </span>
            </div>

            {/* Desktop Navigation links */}
            <div className="hidden lg:flex items-center gap-5 text-sm text-[#8B949E] font-medium">
              <button 
                onClick={() => handleScrollToId("ob-solution")}
                className="flex items-center gap-1 hover:text-[#F0F6FC] transition-colors py-1 cursor-pointer bg-transparent border-none"
              >
                Product <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => handleScrollToId("ob-compliance")}
                className="flex items-center gap-1 hover:text-[#F0F6FC] transition-colors py-1 cursor-pointer bg-transparent border-none"
              >
                Open Source <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => handleScrollToId("ob-tutorial")}
                className="flex items-center gap-1 hover:text-[#F0F6FC] transition-colors py-1 cursor-pointer bg-transparent border-none"
              >
                Fellowship <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => handleScrollToId("ob-setup-workstation")}
                className="hover:text-[#F0F6FC] transition-colors py-1 cursor-pointer bg-transparent border-none"
              >
                Resources
              </button>
            </div>
          </div>

          {/* Center Search command bar */}
          <div className="hidden md:flex items-center flex-grow max-w-xs xl:max-w-sm mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                readOnly
                placeholder="Search or jump to... "
                className="w-full bg-[#161B22] border border-[#30363D] hover:border-[#8B949E] rounded-md pl-9 pr-8 py-1.5 text-xs text-[#F0F6FC] placeholder-[#8B949E] cursor-not-allowed text-left select-none transition-all"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-[#21262d] border border-[#30363d] text-[10px] text-[#8B949E] px-1.5 py-0.2 rounded font-mono">
                /
              </span>
            </div>
          </div>

          {/* Right section: Auth controls */}
          <div className="hidden md:flex items-center gap-4">
            {githubUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <img 
                    src={githubUser.avatar_url} 
                    alt={githubUser.login}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-[#2F81F7]" 
                  />
                  <span className="text-xs font-mono text-[#8B949E] font-semibold">{githubUser.login}</span>
                </div>
                <button
                  onClick={onDisconnectGithub}
                  className="text-xs text-[#D29922] hover:underline cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={onConnectGithub}
                className="text-sm font-medium text-[#8B949E] hover:text-[#F0F6FC] transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}

            <button
              onClick={handleScrollToSetup}
              className="bg-[#238636] hover:bg-[#2ea44f] text-white text-xs font-semibold px-3.5 py-1.5 rounded-md border border-[#2ea44f] hover:border-emerald-400 transition-colors shadow-sm cursor-pointer"
            >
              Start Contributing
            </button>
          </div>

          {/* Mobile responsive toggle button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[#8B949E] hover:text-[#F0F6FC] bg-[#161B22] border border-[#30363D] rounded-md"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile menu container */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#0D1117] pt-20 px-4 space-y-4 font-semibold text-lg select-none border-b border-[#30363D] flex flex-col justify-start">
          <button 
            className="absolute top-4 right-4 p-2 text-[#8B949E]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="border-b border-[#30363D] pb-3 text-sm text-[#8B949E]">MENU NAVIGATION</div>
          <button 
            onClick={() => { setMobileMenuOpen(false); handleScrollToId("ob-solution"); }}
            className="text-left py-2 border-b border-[#30363D]/40 text-[#8B949E] hover:text-[#F0F6FC] cursor-pointer bg-transparent border-none"
          >
            Product
          </button>
          <button 
            onClick={() => { setMobileMenuOpen(false); handleScrollToId("ob-compliance"); }}
            className="text-left py-2 border-b border-[#30363D]/40 text-[#8B949E] hover:text-[#F0F6FC] cursor-pointer bg-transparent border-none"
          >
            Open Source
          </button>
          <button 
            onClick={() => { setMobileMenuOpen(false); handleScrollToId("ob-tutorial"); }}
            className="text-left py-2 border-b border-[#30363D]/40 text-[#8B949E] hover:text-[#F0F6FC] cursor-pointer bg-transparent border-none"
          >
            Fellowship
          </button>
          <button 
            onClick={() => { setMobileMenuOpen(false); handleScrollToId("ob-setup-workstation"); }}
            className="text-left py-2 border-b border-[#30363D]/40 text-[#8B949E] hover:text-[#F0F6FC] cursor-pointer bg-transparent border-none"
          >
            Resources
          </button>
          
          <div className="pt-6 space-y-3">
            {githubUser ? (
              <div className="flex items-center gap-3 bg-[#161B22] border border-[#30363D] p-3 rounded-lg">
                <img src={githubUser.avatar_url} className="w-8 h-8 rounded-full border border-[#2F81F7]" />
                <span className="text-xs font-mono">{githubUser.login}</span>
                <button onClick={onDisconnectGithub} className="text-xs text-[#D29922] ml-auto">Sign Out</button>
              </div>
            ) : (
              <button 
                onClick={() => { setMobileMenuOpen(false); onConnectGithub(); }}
                className="w-full text-center py-2.5 bg-[#161B22] border border-[#30363D] rounded-lg text-sm font-semibold"
              >
                Sign In
              </button>
            )}
            <button 
              onClick={() => { setMobileMenuOpen(false); handleScrollToSetup(); }}
              className="w-full text-center py-2.5 bg-[#238636] text-white rounded-lg text-sm font-semibold border border-[#2ea44f]"
            >
              Start Contributing
            </button>
          </div>
        </div>
      )}

      {/* 2. HERO SECTION WITH DELEGATE LAYOUT & DETAILED MOCKUP */}
      <section className="relative pt-16 sm:pt-24 pb-28 border-b border-[#30363D] overflow-hidden">
        
        {/* Crisp background coordinates mapping layout */}
        <div className="absolute top-0 left-10 w-full h-[500px] bg-[linear-gradient(to_right,#1f242c_1px,transparent_1px),linear-gradient(to_bottom,#1f242c_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_20%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* LEFT COLUMN: HERO INFORMATION */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left select-none">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#2F81F7]/10 border border-[#2F81F7]/35 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#2F81F7]" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#58A6FF] font-bold">
                Platform Release v2.6
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F0F6FC] leading-[1.05] font-sans">
                Find your path <br className="hidden sm:inline" />
                into <span className="bg-gradient-to-r from-[#2F81F7] via-[#58d5ff] to-[#39D353] text-transparent bg-clip-text">Open Source</span>
              </h1>
              
              <p className="text-[#8B949E] text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                OpenBridge helps developers discover repositories, understand issues with AI integration, and navigate contribution pathways like Hacktoberfest and GSOC.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-1">
              <button
                onClick={handleScrollToSetup}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#238636] hover:bg-[#2ea44f] border border-[#2ea44f] hover:border-emerald-400 text-[#ffffff] font-semibold text-sm rounded-md transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const target = document.getElementById("ob-features-struggle");
                  target?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#161B22] hover:bg-[#30363D] border border-[#30363D] hover:border-[#8B949E] text-[#F0F6FC] font-semibold text-sm rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Explore Repositories
              </button>
            </div>

            <div className="pt-4 border-t border-[#30363D]/60 max-w-sm mx-auto lg:mx-0">
              <span className="block text-xs font-mono uppercase text-[#8B949E] tracking-widest font-bold">
                Trusted by developers entering the Open Source ecosystem
              </span>
            </div>

          </div>

          {/* RIGHT COLUMN: HIGH-FIDELITY LIVE INTERACTIVE DASHBOARD PREVIEW */}
          <div className="lg:col-span-6 animate-fade-in">
            <div className="bg-[#161B22] border border-[#30363D] rounded-lg overflow-hidden shadow-2xl relative">
              
              {/* Fake Chrome window task bar */}
              <div className="bg-[#0D1117] border-b border-[#30363D] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 select-none text-zinc-600">
                  <span className="w-3 h-3 rounded-full bg-[#f85149]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#d29922]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#3fb950]"></span>
                </div>
                
                <div className="flex items-center gap-1 bg-[#161B22] border border-[#30363D]/90 rounded px-2.5 py-0.5 text-[10px] font-mono text-[#8B949E]">
                  <Layers className="w-3 h-3 text-[#2F81F7]" />
                  <span>openbridge-mentor-sandbox</span>
                </div>

                <div className="w-10"></div>
              </div>

              {/* Sub-Header: Mock interactive tabs controllers */}
              <div className="bg-[#161B22] border-b border-[#30363D] flex overflow-x-auto scrollbar-none">
                
                <button
                  onClick={() => setActiveMockTab("recs")}
                  className={`px-4 py-2.5 text-xs font-mono font-medium border-r border-[#30363D] whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    activeMockTab === "recs"
                      ? "bg-[#0D1117] text-[#58A6FF] border-b-2 border-b-[#f78166]"
                      : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#0D1117]/50"
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  Recommendations
                </button>

                <button
                  onClick={() => setActiveMockTab("roadmap")}
                  className={`px-4 py-2.5 text-xs font-mono font-medium border-r border-[#30363D] whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    activeMockTab === "roadmap"
                      ? "bg-[#0D1117] text-[#58A6FF] border-b-2 border-b-[#f78166]"
                      : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#0D1117]/50"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Milestone Roadmap
                </button>

                <button
                  onClick={() => setActiveMockTab("issue")}
                  className={`px-4 py-2.5 text-xs font-mono font-medium border-r border-[#30363D] whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    activeMockTab === "issue"
                      ? "bg-[#0D1117] text-[#58A6FF] border-b-2 border-b-[#f78166]"
                      : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#0D1117]/50"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  AI Issue Translation
                </button>

                <button
                  onClick={() => setActiveMockTab("prs")}
                  className={`px-4 py-2.5 text-xs font-mono font-medium border-r border-[#30363D] whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    activeMockTab === "prs"
                      ? "bg-[#0D1117] text-[#58A6FF] border-b-2 border-b-[#f78166]"
                      : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#0D1117]/50"
                  }`}
                >
                  <GitPullRequest className="w-3.5 h-3.5" />
                  PR Activity
                </button>

              </div>

              {/* Card mock body based on current active tab */}
              <div className="p-5 bg-[#0D1117] min-h-[290px] text-xs leading-relaxed select-none">
                
                {activeMockTab === "recs" && (
                  <div className="space-y-3.5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#8B949E] uppercase font-bold tracking-wider">AI RECOMMENDATIONS</span>
                      <span className="text-[10px] bg-[#238636]/15 hover:bg-[#238636]/30 text-[#39D353] border border-[#238636]/40 px-2 py-0.5 rounded font-mono font-bold">2 matched repositories</span>
                    </div>

                    {/* Repo 1 */}
                    <div className="border border-[#30363D] bg-[#161B22] rounded-md p-3.5 space-y-2 hover:border-[#8B949E]/60 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5 min-w-0">
                          <span className="block font-mono text-xs text-[#2F81F7] font-bold hover:underline cursor-pointer">
                            reactlabs / dynamic-context-bridge
                          </span>
                          <span className="block text-[10px] text-[#8B949E] truncate">High Performance Context Management State Container</span>
                        </div>
                        <button 
                          onClick={() => {
                            setMockStarred(!mockStarred);
                            setMockStarCount(c => mockStarred ? c - 1 : c + 1);
                          }}
                          className={`flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono rounded border transition-colors ${
                            mockStarred 
                              ? "bg-[#30363D] text-[#D29922] border-[#D29922]" 
                              : "bg-[#21262d] border-[#30363D] text-[#8B949E] hover:text-[#F0F6FC]"
                          }`}
                        >
                          <Star className={`w-3 h-3 ${mockStarred ? "fill-[#D29922] text-[#D29922]" : ""}`} />
                          <span>{mockStarCount}</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-[9px] font-mono text-[#8B949E]">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#3178c6] block"></span>
                          TypeScript
                        </span>
                        <span>Forks: 104</span>
                        <span className="px-1.5 py-0.1 bg-[#238636]/10 text-[#3fb950] border border-[#238636]/30 rounded text-[8px] font-bold uppercase">Beginner Match 96%</span>
                      </div>
                    </div>

                    {/* Repo 2 */}
                    <div className="border border-[#30363D] bg-[#161B22] rounded-md p-3.5 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5 min-w-0">
                          <span className="block font-mono text-xs text-[#2F81F7] font-bold">
                            expressjs / smart-compression-loader
                          </span>
                          <span className="block text-[10px] text-[#8B949E] truncate">Dynamic server-side asset encoding middleware</span>
                        </div>
                        <span className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono rounded border bg-[#21262d] border-[#30363D] text-[#8B949E]">
                          <Star className="w-3 h-3" />
                          <span>384</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[9px] font-mono text-[#8B949E]">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#f1e05a] block"></span>
                          JavaScript
                        </span>
                        <span>Forks: 42</span>
                        <span className="px-1.5 py-0.1 bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/20 rounded text-[8px] font-bold uppercase">Intermediate Match</span>
                      </div>
                    </div>

                  </div>
                )}

                {activeMockTab === "roadmap" && (
                  <div className="space-y-3.5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#8B949E] uppercase font-bold tracking-wider">GUIDED 4-WEEK ASSIGNMENT</span>
                      <span className="text-[10px] text-[#8B949E] font-mono">Week 1 Active Progress: 50%</span>
                    </div>

                    <div className="border border-[#30363D] bg-[#161B22] rounded-md divide-y divide-[#30363D] overflow-hidden">
                      <div className="p-3 bg-[#1c2128] font-mono text-[11px] font-semibold text-[#F0F6FC]">
                        📚 Week 1: Environment Readiness & GPG Check
                      </div>
                      
                      {/* Checkbox item 1 */}
                      <div 
                        onClick={() => handleToggleMockTask("week1-0")}
                        className="p-3 flex items-start gap-2.5 hover:bg-[#21262d]/50 cursor-pointer transition-colors"
                      >
                        <div className={`w-4 h-4 rounded-sm border mt-0.5 flex items-center justify-center transition-all ${
                          mockCheckedTasks["week1-0"] 
                            ? "bg-[#238636] border-[#2ea44f]" 
                            : "border-[#30363D] bg-[#0D1117]"
                        }`}>
                          {mockCheckedTasks["week1-0"] && <Check className="w-3 h-3 text-white stroke-[3.5]" />}
                        </div>
                        <div>
                          <span className={`block font-semibold ${mockCheckedTasks["week1-0"] ? "line-through text-[#8B949E]" : "text-[#F0F6FC]"}`}>
                            GPG Cryptographic Key Signature Validation
                          </span>
                          <span className="block text-[10px] text-[#8B949E]">Construct a secure GPG sign-off key on the pre-flight console</span>
                        </div>
                      </div>

                      {/* Checkbox item 2 */}
                      <div 
                        onClick={() => handleToggleMockTask("week1-1")}
                        className="p-3 flex items-start gap-2.5 hover:bg-[#21262d]/50 cursor-pointer transition-colors"
                      >
                        <div className={`w-4 h-4 rounded-sm border mt-0.5 flex items-center justify-center transition-all ${
                          mockCheckedTasks["week1-1"] 
                            ? "bg-[#238636] border-[#2ea44f]" 
                            : "border-[#30363D] bg-[#0D1117]"
                        }`}>
                          {mockCheckedTasks["week1-1"] && <Check className="w-3 h-3 text-white stroke-[3.5]" />}
                        </div>
                        <div>
                          <span className={`block font-semibold ${mockCheckedTasks["week1-1"] ? "line-through text-[#8B949E]" : "text-[#F0F6FC]"}`}>
                            Inspect codebase hierarchy
                          </span>
                          <span className="block text-[10px] text-[#8B949E]">Fork and download entry scripts on the integrated editor tool</span>
                        </div>
                      </div>

                    </div>
                    <p className="text-[10px] font-mono text-[#8B949E] text-center">💡 Check items to interactively trigger roadmap state progression.</p>
                  </div>
                )}

                {activeMockTab === "issue" && (
                  <div className="space-y-3.5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#8B949E] uppercase font-bold tracking-wider">GEMINI ISSUE EXPLAINER</span>
                      <span className="text-[10px] text-[#58A6FF] font-mono flex items-center gap-1 font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI translation sandbox
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="bg-[#161B22] border border-[#30363D] p-3 rounded-md">
                        <span className="block text-[9px] font-mono uppercase text-[#F85149] font-bold mb-1">Raw Bug Log Input</span>
                        <input
                          type="text"
                          value={mockTranslateQuery}
                          onChange={(e) => setMockTranslateQuery(e.target.value)}
                          className="w-full bg-[#0D1117] border border-[#30363D] text-[11px] font-mono text-[#F0F6FC] px-2 py-1.5 rounded focus:outline-none focus:border-[#2F81F7]"
                        />
                      </div>

                      <div className="bg-[#161B22] border border-[#30363D] p-3 rounded-md space-y-1.5 font-mono text-[10.5px]">
                        <span className="block text-[9px] uppercase text-[#39D353] font-bold">Gemini Context Parsing</span>
                        <p className="text-[#F0F6FC] font-semibold">Diagnosis: Standard Bootstrap Crash</p>
                        <p className="text-[#8B949E] leading-relaxed">
                          The function <code className="text-[#f78166]">bootstrapTelemetry()</code> tries to load variables but the main workstation config dictionary is missing or unresolved.
                        </p>
                        <div className="text-[9.5px] text-[#58A6FF] font-semibold flex items-center gap-1 mt-1">
                          <CheckCircle className="w-3.5 h-3.5 text-[#39D353]" />
                          Action Item: Check environmental config variables in server file.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeMockTab === "prs" && (
                  <div className="space-y-3.5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#8B949E] uppercase font-bold tracking-wider">ACTIVE WORKSPACE PR FEED</span>
                      <span className="text-[10px] text-[#39D353] font-mono flex items-center gap-1 select-none font-semibold">
                        <span className="w-1.5 h-1.5 bg-[#238636] rounded-full animate-pulse"></span>
                        Sync ok
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="border border-[#124429] bg-[#1f242c]/65 p-3 rounded-md flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-xs text-[#39D353] block">PR #14: Link authorized GitHub signature block</span>
                          <span className="text-[10px] text-[#8B949E] block">Target branch: master • guest-committer</span>
                        </div>
                        <span className="px-2 py-0.5 font-mono bg-[#238636]/20 text-[#39D353] border border-[#238636]/40 rounded text-[9px] font-bold uppercase select-none">
                          Merged
                        </span>
                      </div>

                      <div className="border border-[#30363D] bg-[#161B22] p-3 rounded-md flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-xs text-[#F0F6FC] block">PR #15: Create GPG validation checkpoint signatures</span>
                          <span className="text-[10px] text-[#8B949E] block">WaitMsBeforeAsync verification state completed</span>
                        </div>
                        <span className="px-2 py-0.5 font-mono bg-[#381a54] text-purple-300 border border-purple-900/40 rounded text-[9px] font-bold uppercase select-none">
                          Review
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. PROBLEM SECTION: WHY DEVELOPERS STRUGGLE */}
      <section id="ob-features-struggle" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#30363D] select-none text-center sm:text-left">
        <div className="space-y-12">
          
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono uppercase text-[#2F81F7] font-bold">Traditional Pain Points</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F0F6FC]">
              Why developers struggle with Open Source
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-lg space-y-4 hover:border-[#8B949E]/70 transition-colors shadow-sm">
              <div className="p-2.5 bg-[#f85149]/10 border border-[#f85149]/20 text-[#f85149] rounded-md w-max mx-auto sm:mx-0">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F0F6FC]">Can't find suitable repositories</h3>
              <p className="text-[#8B949E] text-xs leading-relaxed">
                Beginners are often crushed by massive codebases where finding a task appropriate for their current level is a needle in a haystack.
              </p>
            </div>

            <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-lg space-y-4 hover:border-[#8B949E]/70 transition-colors shadow-sm">
              <div className="p-2.5 bg-[#D29922]/10 border border-[#D29922]/20 text-[#D29922] rounded-md w-max mx-auto sm:mx-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F0F6FC]">Don't understand issues</h3>
              <p className="text-[#8B949E] text-xs leading-relaxed">
                Maintainer descriptions are frequently written for internal teams, using highly institutional terms that leave newcomers completely lost.
              </p>
            </div>

            <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-lg space-y-4 hover:border-[#8B949E]/70 transition-colors shadow-sm">
              <div className="p-2.5 bg-purple-900/20 border border-purple-800/25 text-purple-400 rounded-md w-max mx-auto sm:mx-0">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F0F6FC]">Lack roadmap guidance</h3>
              <p className="text-[#8B949E] text-xs leading-relaxed">
                Frictional transitions lead to early abandonment. Without a week-by-week plan, knowing what files to touch or how to run tests is a guessing game.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. SOLUTION SECTION: HOW OPENBRIDGE HELPS */}
      <section id="ob-solution" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#30363D] select-none text-center sm:text-left">
        <div className="space-y-12">
          
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono uppercase text-[#39D353] font-bold">The OpenBridge Fix</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F0F6FC]">
              How OpenBridge helps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-[#161B22] border border-[#30363D] p-5.5 rounded-lg space-y-3.5 hover:border-[#8B949E]/50 transition-colors">
              <div className="p-2 bg-[#2F81F7]/15 text-[#2F81F7] rounded mr-auto w-max mx-auto sm:mx-0">
                <Code className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#F0F6FC]">AI Repository Matching</h3>
              <p className="text-[#8B949E] text-xs leading-relaxed">
                Instantly evaluate your active skill-tree against millions of issue logs. We align repository matches to your exact level with pinpoint precision.
              </p>
            </div>

            <div className="bg-[#161B22] border border-[#30363D] p-5.5 rounded-lg space-y-3.5 hover:border-[#8B949E]/50 transition-colors">
              <div className="p-2 bg-[#39D353]/15 text-[#39D353] rounded mr-auto w-max mx-auto sm:mx-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#F0F6FC]">Issue Translation</h3>
              <p className="text-[#8B949E] text-xs leading-relaxed">
                Bypass institutional context. Feed complex maintainer bug reports to Gemini AI to compile direct, structured, step-by-step resolution playbooks.
              </p>
            </div>

            <div className="bg-[#161B22] border border-[#30363D] p-5.5 rounded-lg space-y-3.5 hover:border-[#8B949E]/50 transition-colors">
              <div className="p-2 bg-[#D29922]/15 text-[#D29922] rounded mr-auto w-max mx-auto sm:mx-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#F0F6FC]">Guided Roadmaps</h3>
              <p className="text-[#8B949E] text-xs leading-relaxed">
                Work through a dynamic 4-week onboarding checklist detailing file inspection, local fork tracing, pre-flight checks, and draft pull request workflows.
              </p>
            </div>

            <div className="bg-[#161B22] border border-[#30363D] p-5.5 rounded-lg space-y-3.5 hover:border-[#8B949E]/50 transition-colors">
              <div className="p-2 bg-purple-900/15 text-purple-400 rounded mr-auto w-max mx-auto sm:mx-0">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#F0F6FC]">Fellowship Discovery</h3>
              <p className="text-[#8B949E] text-xs leading-relaxed">
                Fast-track your enrollment into premier community pathways including LFX, Hacktoberfest, Google Summer of Code, and Outreachy initiatives.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. OPEN SOURCE OPPORTUNITIES SCHEME */}
      <section id="ob-compliance" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#30363D] select-none text-center sm:text-left">
        <div className="space-y-12">
          
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono uppercase text-[#D29922] font-bold">Pathways Alignment</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F0F6FC]">
              Supported Open Source Programs
            </h2>
            <p className="text-[#8B949E] text-sm leading-relaxed max-w-xl">
              Become preparation-ready for major institutional initiatives and open developer internships. We align milestones perfectly to program timelines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-[#161B22] border-l-[3px] border-l-amber-500 border border-[#30363D] rounded p-5 space-y-2 hover:bg-[#161B22]/80 transition-colors">
              <span className="text-[10px] font-mono text-amber-500 uppercase font-bold tracking-wider">Google Initiative</span>
              <h4 className="text-base font-bold text-[#F0F6FC]">GSoC</h4>
              <p className="text-[#8B949E] text-[11px] leading-relaxed">
                Google Summer of Code connects students with real production mentors. Get paid while learning to manage cloud components.
              </p>
            </div>

            <div className="bg-[#161B22] border-l-[3px] border-l-teal-400 border border-[#30363D] rounded p-5 space-y-2 hover:bg-[#161B22]/80 transition-colors">
              <span className="text-[10px] font-mono text-teal-400 uppercase font-bold tracking-wider">DigitalOcean Event</span>
              <h4 className="text-base font-bold text-[#F0F6FC]">Hacktoberfest</h4>
              <p className="text-[#8B949E] text-[11px] leading-relaxed">
                A month-long celebration of public coding. Earn badges and ecosystem credit by committing high quality functional improvements.
              </p>
            </div>

            <div className="bg-[#161B22] border-l-[3px] border-l-rose-400 border border-[#30363D] rounded p-5 space-y-2 hover:bg-[#161B22]/80 transition-colors">
              <span className="text-[10px] font-mono text-rose-400 uppercase font-bold tracking-wider">Remote Internships</span>
              <h4 className="text-base font-bold text-[#F0F6FC]">Outreachy</h4>
              <p className="text-[#8B949E] text-[11px] leading-relaxed">
                Provides 3-month paid remote open source fellowships to marginalized developers looking to break into core infrastructure.
              </p>
            </div>

            <div className="bg-[#161B22] border-l-[3px] border-l-[#2F81F7] border border-[#30363D] rounded p-5 space-y-2 hover:bg-[#161B22]/80 transition-colors">
              <span className="text-[10px] font-mono text-[#2F81F7] uppercase font-bold tracking-wider">Linux Foundation</span>
              <h4 className="text-base font-bold text-[#F0F6FC]">LFX Mentorship</h4>
              <p className="text-[#8B949E] text-[11px] leading-relaxed">
                Learn under CNCF, OpenJS, or Linux Kernel leads. Build hyper-scale components while gaining enterprise validation.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. CONTRIBUTION GRAPH SHOWCASE */}
      <section id="ob-tutorial" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#30363D] select-none text-center sm:text-left">
        <div className="space-y-12">
          
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono uppercase text-[#39D353] font-bold">Telemetry Statistics</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F0F6FC]">
              Interactive Contribution Wave
            </h2>
            <p className="text-[#8B949E] text-sm leading-relaxed max-w-xl">
              Your real-time developer pulse. Every checkmark ticked on a roadmap translates to active, visible progress on your telemetry dashboard.
            </p>
          </div>

          <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="block text-xs font-mono text-[#8B949E] uppercase font-bold">Workspace commit metrics</span>
                <span className="block text-lg font-bold text-[#F0F6FC]">
                  {githubUser ? `789 contributions logged of @${githubUser.login}` : "412 contributions in the last year"}
                </span>
              </div>
              
              <div className="text-[11px] font-mono text-[#8B949E] space-y-1 sm:text-right">
                <span className="block">Active velocity: <strong className="text-[#39D353]">+14 commits this week</strong></span>
                <span className="block">GPG Keys Registered: <strong className="text-[#39D353]">✓ Active</strong></span>
              </div>
            </div>

            {/* Simulated Contribution Grid */}
            <div className="overflow-x-auto scrollbar-none py-2 bg-[#0D1117] border border-[#30363D] rounded-lg p-5">
              <div className="min-w-[650px] space-y-1.5 cursor-crosshair">
                {contribGrid.current.map((cols, rowIndex) => (
                  <div key={rowIndex} className="flex gap-1">
                    {cols.map((intensity, colIndex) => {
                      let color = "bg-[#161B22]";
                      if (intensity === 1) color = "bg-[#0e4429]";
                      else if (intensity === 2) color = "bg-[#006d32]";
                      else if (intensity === 3) color = "bg-[#26a641]";
                      else if (intensity === 4) color = "bg-[#39d353]";

                      return (
                        <div 
                          key={colIndex} 
                          className={`w-3 h-3 rounded-[2px] transition-all hover:scale-125 hover:border hover:border-white/40 ${color}`}
                          title={`Contributions level ${intensity}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-[#8B949E]">
              <span>Learn how telemetry works</span>
              <div className="flex items-center gap-1">
                <span>Less</span>
                <div className="w-2.5 h-2.5 bg-[#161B22] rounded-[2px]" />
                <div className="w-2.5 h-2.5 bg-[#0e4429] rounded-[2px]" />
                <div className="w-2.5 h-2.5 bg-[#006d32] rounded-[2px]" />
                <div className="w-2.5 h-2.5 bg-[#26a641] rounded-[2px]" />
                <div className="w-2.5 h-2.5 bg-[#39d353] rounded-[2px]" />
                <span>More</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. CUSTOM WORKSTATION ONBOARDING PROFILER (THE FORM) */}
      <section id="ob-setup-workstation" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none border-t border-[#30363D]">
        {!githubUser ? (
          /* EMBEDDED IMMERSIVE CYBER GATEWAY PASS */
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden p-8 md:p-12 relative shadow-2xl" id="cyber-gateway-pass">
            {/* Ambient cyber decorations */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#238636]/10 rounded-full blur-[70px] pointer-events-none" id="ambient-emerald-glow"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#2f81f7]/10 rounded-full blur-[70px] pointer-events-none" id="ambient-blue-glow"></div>

            <div className="relative z-10 max-w-4xl mx-auto space-y-8 text-center sm:text-left" id="cyber-gate-content">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-[#30363D] pb-6" id="gate-header-bar">
                <div className="space-y-2" id="gate-title-block">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-red-950/30 border border-red-900/40 text-red-400 rounded-md text-[10px] font-mono uppercase font-bold tracking-wider" id="secure-handshake-badge">
                    <Shield className="w-3.5 h-3.5" />
                    Secure Session Handshake Required
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F0F6FC]" id="gate-headline">
                    Gated Workstation Access
                  </h2>
                </div>
                
                <span className="text-[10px] text-zinc-500 font-mono inline-flex items-center gap-1.5 bg-[#0D1117] border border-[#30363D] px-3 py-1.5 rounded-md" id="status-gated-indicator">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" id="pulse-dot"></span>
                  Gated Access Mode
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center" id="gate-main-layout">
                {/* Info and value explanations */}
                <div className="md:col-span-7 space-y-4 text-left" id="gate-info-block">
                  <p className="text-[#8B949E] text-xs leading-relaxed font-mono" id="gate-explainer">
                    OpenBridge leverages your genuine GitHub profile characteristics to automatically customize recommended project pathways, milestones, week-by-week issue translation guides, and preflight security scopes.
                  </p>
                  
                  <div className="space-y-3.5 mt-6" id="gate-features-list">
                    <div className="flex items-start gap-3" id="feat-tailored">
                      <div className="p-1.5 bg-[#2F81F7]/10 text-[#2F81F7] rounded mt-0.5" id="feat-tailored-icon">
                        <Code className="w-4 h-4" />
                      </div>
                      <div id="feat-tailored-text">
                        <span className="block text-xs font-bold text-[#F0F6FC]">Tailored Issue Recommendations</span>
                        <span className="block text-[11px] text-[#8B949E] mt-0.5">We extract listed topics, public repositories count, and profile statistics to index best-suited issues.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3" id="feat-milestones">
                      <div className="p-1.5 bg-purple-900/20 text-purple-400 rounded mt-0.5" id="feat-milestones-icon">
                        <Award className="w-4 h-4" />
                      </div>
                      <div id="feat-milestones-text">
                        <span className="block text-xs font-bold text-[#F0F6FC]">Personalized Milestone Progress Paths</span>
                        <span className="block text-[11px] text-[#8B949E] mt-0.5">Our 4-week roadmap is dynamically generated and structured for your current experience.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secure auth triggers */}
                <div className="md:col-span-5 bg-[#0D1117] border border-[#30363D] p-6 rounded-xl space-y-4" id="gate-auth-triggers-card">
                  <span className="block text-[10px] font-mono text-[#8B949E] uppercase font-bold text-center tracking-wider mb-2" id="trigger-card-title">Select Handshake Credential</span>

                  <button
                    onClick={onConnectGithub}
                    className="w-full bg-[#1F242C] hover:bg-[#30363D] border border-[#30363D] text-[#F0F6FC] hover:border-[#8B949E] text-xs py-3 px-4 rounded-md font-mono font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md"
                    id="connect-real-github-btn"
                  >
                    <Github className="w-4 h-4 text-[#58A6FF]" />
                    Link Real GitHub Profile
                  </button>

                  <div className="relative text-center select-none py-1" id="or-divider">
                    <span className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#30363D]/65"></span></span>
                    <span className="relative bg-[#0D1117] px-3 text-[10px] font-mono uppercase font-bold text-zinc-500">OR</span>
                  </div>

                  <div className="bg-[#161B22] border border-[#30363D] p-3 rounded-md space-y-2.5 mb-1.5" id="guest-access-card">
                    <div className="flex items-center gap-1.5 text-emerald-500 font-bold font-mono text-[10px] uppercase" id="demo-badge">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Judges Demo Pass</span>
                    </div>
                    <p className="text-[10px] text-[#8B949E] leading-relaxed" id="guest-desc">
                      Instant sandbox trace using the verified <strong className="text-[#39D353]">@guest-committer</strong> simulation profile.
                    </p>
                    <button
                      onClick={onConnectGuest}
                      className="w-full bg-[#238636] hover:bg-[#2ea44f] text-white border border-[#2ea44f] text-xs py-2.5 px-3 rounded font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      id="connect-guest-btn"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Demo: Enter as Guest Committer
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center md:text-left text-[11px] text-zinc-500 font-mono flex items-center gap-2 justify-center md:justify-start" id="gate-callback-details">
                <Info className="w-3.5 h-3.5" />
                <span>Redirect Handshake Host Callback: <strong className="text-zinc-400 underline">{window.location.origin}/auth/callback</strong></span>
              </div>
            </div>
          </div>
        ) : (
          /* WORKSTATION PROFILER IN ACTION (LOGGED IN) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start" id="active-profiler-layout">
            
            {/* Controls column containing our BRAND-NEW, CREATIVE GitHub Profile Insights widget! */}
            <div className="lg:col-span-4 bg-[#161B22] border border-[#30363D] rounded-lg p-5 space-y-5 animate-fade-in shadow-xl" id="profile-insights-panel">
              <div className="flex items-center gap-2 pb-3.5 border-b border-[#30363D] text-xs font-mono font-bold text-[#8B949E]" id="dashboard-insights-header">
                <Terminal className="w-4 h-4 text-[#39D353]" />
                <span>DYNAMIC PROFILE INSIGHTS</span>
              </div>

              <div className="space-y-4" id="dashboard-insights-body">
                <div className="flex items-center gap-3 bg-[#0D1117] p-3 rounded-md border border-[#30363D]" id="user-badge">
                  <img src={githubUser.avatar_url} className="w-10 h-10 rounded-full border-2 border-[#39D353]" referrerPolicy="no-referrer" id="user-avatar-image" />
                  <div className="min-w-0" id="user-name-wrapper">
                    <span className="block text-xs font-bold text-[#F0F6FC] truncate" id="user-handle">@{githubUser.login}</span>
                    <span className="block text-[10px] text-zinc-500 font-mono truncate" id="user-title">{githubUser.name || "GitHub Developer"}</span>
                  </div>
                </div>

                <div className="space-y-3" id="user-footprint-grid">
                  <span className="block text-[10px] font-mono uppercase text-[#8B949E] tracking-wider font-bold" id="footprint-header-text">Footprint Evaluation</span>
                  <div className="grid grid-cols-2 gap-2" id="footprint-stats">
                    <div className="bg-[#0D1117] border border-[#30363D] p-2.5 rounded text-center" id="stat-repos">
                      <span className="block text-lg font-bold text-[#F0F6FC] font-mono">{githubUser.public_repos || 0}</span>
                      <span className="block text-[9px] text-[#8B949E] font-mono uppercase">Repositories</span>
                    </div>
                    <div className="bg-[#0D1117] border border-[#30363D] p-2.5 rounded text-center" id="stat-followers">
                      <span className="block text-lg font-bold text-[#F0F6FC] font-mono">{githubUser.followers || 0}</span>
                      <span className="block text-[9px] text-[#8B949E] font-mono uppercase">Followers</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-950/45 border border-[#30363D] rounded-md space-y-2.5 text-xs" id="custom-diagnostics-box">
                  <span className="block text-[10px] font-mono text-[#8B949E] uppercase font-bold tracking-wider" id="diagnostics-headline">AI Tailoring Diagnostic</span>
                  
                  <div className="flex items-center justify-between font-mono text-[10.5px]" id="diag-reputation">
                    <span className="text-[#8B949E]">Reputation Tier:</span>
                    <span className="text-zinc-200 font-bold uppercase" id="reputation-rating">
                      {githubUser.followers > 100 ? "Class-A Leader" : "Rising Starter"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-mono text-[10.5px]" id="diag-signal">
                    <span className="text-[#8B949E]">OpenBridge Signal:</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#238636]/15 text-[#39D353] text-[9px] font-bold uppercase animate-pulse" id="tailor-status-tag">
                      Tailoring Ready
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#30363D]/65 text-[10px] text-zinc-500 leading-normal" id="diag-tip">
                    💡 Our recommendation system automatically feeds your GitHub footprint details into Gemini to suggest highly customized experience pathways.
                  </div>
                </div>

                <div className="pt-3 border-t border-[#30363D] flex justify-between items-center text-[10px] font-mono" id="insights-footer">
                  <span className="text-[#39D353] font-bold flex items-center gap-1" id="verified-footprint-tag">
                    <span className="w-1.5 h-1.5 bg-[#238636] rounded-full animate-pulse" id="dot-green"></span> Verified handshaked
                  </span>
                  <button onClick={onDisconnectGithub} className="text-[#f85149] hover:underline cursor-pointer bg-transparent border-none" id="signout-session-btn">
                    Disconnect Session
                  </button>
                </div>
              </div>
            </div>

            {/* Setup Profiler Column */}
            <div className="lg:col-span-8 bg-[#161B22] border border-[#30363D] rounded-lg p-6 space-y-6" id="setup-variables-panel">
              <div className="space-y-1.5" id="variables-header">
                <h2 className="text-xl font-bold tracking-tight text-[#F0F6FC]" id="variables-title">
                  Setup Workspace Variables
                </h2>
                <p className="text-[#8B949E] text-xs font-mono leading-relaxed" id="variables-desc">
                  OpenBridge leverages your parameters to dynamically fetch relevant codebase issues and synthesize milestones. Select your primary domain, difficulty level, and tools below:
                </p>
              </div>

              <ProfilingForm onSubmit={onSubmitProfile} isLoading={isLoading} githubUser={githubUser} />
            </div>

          </div>
        )}
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-[#30363D] bg-[#0D1117] py-12 text-[#8B949E] text-xs font-mono select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-[#2F81F7]" />
            <span className="font-bold text-sm text-[#F0F6FC]">OpenBridge</span>
            <span className="text-[10px] text-zinc-600">© 2026 OpenBridge, Inc.</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-5 text-[11px]">
            <a href="https://github.com/opensource/code-of-conduct" target="_blank" rel="noreferrer" className="hover:text-[#2F81F7] transition-colors">Code of Conduct</a>
            <a href="https://opensource.org" target="_blank" rel="noreferrer" className="hover:text-[#2F81F7] transition-colors">OSI Parity</a>
            <a href="#" className="hover:text-[#2F81F7] transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-[#2F81F7] transition-colors">Security Controls</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
