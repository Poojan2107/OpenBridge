import { useState } from "react";
import { Sparkles, ArrowRight, Zap, Layers, Compass, MessageSquare, GitPullRequest, Star, Check, CheckCircle, Code, ExternalLink } from "lucide-react";

interface HeroSectionProps {
  onConnectGuest: () => void;
}

export function HeroSection({ onConnectGuest }: HeroSectionProps) {
  const [activeMockTab, setActiveMockTab] = useState<"recs" | "roadmap" | "issue" | "prs">("recs");
  const [mockTranslateQuery, setMockTranslateQuery] = useState(
    "Uncaught TypeError: Cannot read properties of undefined (reading 'config') at bootstrapTelemetry (telemetry.ts:142:19)"
  );
  const [mockCheckedTasks, setMockCheckedTasks] = useState<Record<string, boolean>>({
    "week1-0": true,
    "week1-1": false,
    "week2-0": false,
  });
  const [mockStarred, setMockStarred] = useState(false);
  const [mockStarCount, setMockStarCount] = useState(512);

  const handleToggleMockTask = (key: string) => {
    setMockCheckedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    { id: "recs" as const, label: "Recommendations", icon: Compass },
    { id: "roadmap" as const, label: "Milestone Roadmap", icon: Sparkles },
    { id: "issue" as const, label: "AI Issue Translation", icon: MessageSquare },
    { id: "prs" as const, label: "PR Activity", icon: GitPullRequest },
  ];

  return (
    <section className="relative pt-16 sm:pt-24 pb-28 border-b border-[#30363D] overflow-hidden">
      <div className="absolute top-0 left-10 w-full h-[500px] bg-[linear-gradient(to_right,#1f242c_1px,transparent_1px),linear-gradient(to_bottom,#1f242c_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_20%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-6 space-y-8 text-center lg:text-left select-none">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#2F81F7]/10 border border-[#2F81F7]/35 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-[#2F81F7]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#58A6FF] font-bold">Platform Release v2.6</span>
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
              onClick={onConnectGuest}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#238636] hover:bg-[#2ea44f] border border-[#2ea44f] hover:border-emerald-400 text-[#ffffff] font-semibold text-sm rounded-md transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              aria-label="Start Demo as Guest Committer"
            >
              <Zap className="w-4 h-4" />
              <span>Start Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => document.getElementById("ob-features-struggle")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#161B22] hover:bg-[#30363D] border border-[#30363D] hover:border-[#8B949E] text-[#F0F6FC] font-semibold text-sm rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              Explore Repositories
            </button>
          </div>
          <div className="pt-4 border-t border-[#30363D]/60 max-w-sm mx-auto lg:mx-0">
            <span className="block text-xs font-mono uppercase text-[#8B949E] tracking-widest font-bold">GitHub OAuth — in active development</span>
          </div>
        </div>
        <div className="lg:col-span-6 animate-fade-in">
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg overflow-hidden shadow-2xl relative">
            <div className="bg-[#0D1117] border-b border-[#30363D] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 select-none text-zinc-600" aria-hidden="true">
                <span className="w-3 h-3 rounded-full bg-[#f85149]" />
                <span className="w-3 h-3 rounded-full bg-[#d29922]" />
                <span className="w-3 h-3 rounded-full bg-[#3fb950]" />
              </div>
              <div className="flex items-center gap-1 bg-[#161B22] border border-[#30363D]/90 rounded px-2.5 py-0.5 text-[10px] font-mono text-[#8B949E]">
                <Layers className="w-3 h-3 text-[#2F81F7]" />
                <span>openbridge-mentor-sandbox</span>
              </div>
              <div className="w-10" />
            </div>
            <div className="bg-[#161B22] border-b border-[#30363D] flex overflow-x-auto scrollbar-none">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMockTab(tab.id)}
                    className={`px-4 py-2.5 text-xs font-mono font-medium border-r border-[#30363D] whitespace-nowrap flex items-center gap-1.5 transition-all ${
                      activeMockTab === tab.id
                        ? "bg-[#0D1117] text-[#58A6FF] border-b-2 border-b-[#f78166]"
                        : "text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#0D1117]/50"
                    }`}
                    aria-pressed={activeMockTab === tab.id}
                    aria-label={`Switch to ${tab.label} tab`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div className="p-5 bg-[#0D1117] min-h-[290px] text-xs leading-relaxed select-none">
              {activeMockTab === "recs" && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#8B949E] uppercase font-bold tracking-wider">AI RECOMMENDATIONS</span>
                    <span className="text-[11px] bg-[#238636]/15 hover:bg-[#238636]/30 text-[#39D353] border border-[#238636]/40 px-2 py-0.5 rounded font-mono font-bold">2 matched repositories</span>
                  </div>
                  <div className="border border-[#30363D] bg-[#161B22] rounded-md p-3.5 space-y-2 hover:border-[#8B949E]/60 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5 min-w-0">
                        <span className="block font-mono text-xs text-[#2F81F7] font-bold hover:underline cursor-pointer">reactlabs / dynamic-context-bridge</span>
                        <span className="block text-[11px] text-[#8B949E] truncate">High Performance Context Management State Container</span>
                      </div>
                      <button
                        onClick={() => { setMockStarred(!mockStarred); setMockStarCount(c => mockStarred ? c - 1 : c + 1); }}
                        className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                          mockStarred ? "bg-[#30363D] text-[#D29922] border-[#D29922]" : "bg-[#21262d] border-[#30363D] text-[#8B949E] hover:text-[#F0F6FC]"
                        }`}
                        aria-label={mockStarred ? "Unstar repository" : "Star repository"}
                      >
                        <Star className={`w-3 h-3 ${mockStarred ? "fill-[#D29922] text-[#D29922]" : ""}`} />
                        <span>{mockStarCount}</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-[#8B949E]">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#3178c6] block" aria-hidden="true" /> TypeScript
                      </span>
                      <span>Forks: 104</span>
                      <span className="px-1.5 py-0.1 bg-[#238636]/10 text-[#3fb950] border border-[#238636]/30 rounded text-[10px] font-bold uppercase">Beginner Match 96%</span>
                    </div>
                  </div>
                  <div className="border border-[#30363D] bg-[#161B22] rounded-md p-3.5 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5 min-w-0">
                        <span className="block font-mono text-xs text-[#2F81F7] font-bold">expressjs / smart-compression-loader</span>
                        <span className="block text-[11px] text-[#8B949E] truncate">Dynamic server-side asset encoding middleware</span>
                      </div>
                      <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono rounded border bg-[#21262d] border-[#30363D] text-[#8B949E]">
                        <Star className="w-3 h-3" /> <span>384</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-[#8B949E]">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#f1e05a] block" aria-hidden="true" /> JavaScript
                      </span>
                      <span>Forks: 42</span>
                      <span className="px-1.5 py-0.1 bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/20 rounded text-[10px] font-bold uppercase">Intermediate Match</span>
                    </div>
                  </div>
                </div>
              )}
              {activeMockTab === "roadmap" && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#8B949E] uppercase font-bold tracking-wider">GUIDED 4-WEEK ASSIGNMENT</span>
                    <span className="text-[11px] text-[#8B949E] font-mono">Week 1 Active Progress: 50%</span>
                  </div>
                  <div className="border border-[#30363D] bg-[#161B22] rounded-md divide-y divide-[#30363D] overflow-hidden">
                    <div className="p-3 bg-[#1c2128] font-mono text-xs font-semibold text-[#F0F6FC]" aria-label="Week 1 milestone">Environment Readiness & GPG Check</div>
                    <div onClick={() => handleToggleMockTask("week1-0")} className="p-3 flex items-start gap-2.5 hover:bg-[#21262d]/50 cursor-pointer transition-colors" role="checkbox" aria-checked={!!mockCheckedTasks["week1-0"]} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleToggleMockTask("week1-0"); } }}>
                      <div className={`w-4 h-4 rounded-sm border mt-0.5 flex items-center justify-center transition-all ${mockCheckedTasks["week1-0"] ? "bg-[#238636] border-[#2ea44f]" : "border-[#30363D] bg-[#0D1117]"}`}>
                        {mockCheckedTasks["week1-0"] && <Check className="w-3 h-3 text-white stroke-[3.5]" />}
                      </div>
                      <div>
                        <span className={`block font-semibold text-xs ${mockCheckedTasks["week1-0"] ? "line-through text-[#8B949E]" : "text-[#F0F6FC]"}`}>GPG Cryptographic Key Signature Validation</span>
                        <span className="block text-[11px] text-[#8B949E]">Construct a secure GPG sign-off key on the pre-flight console</span>
                      </div>
                    </div>
                    <div onClick={() => handleToggleMockTask("week1-1")} className="p-3 flex items-start gap-2.5 hover:bg-[#21262d]/50 cursor-pointer transition-colors" role="checkbox" aria-checked={!!mockCheckedTasks["week1-1"]} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleToggleMockTask("week1-1"); } }}>
                      <div className={`w-4 h-4 rounded-sm border mt-0.5 flex items-center justify-center transition-all ${mockCheckedTasks["week1-1"] ? "bg-[#238636] border-[#2ea44f]" : "border-[#30363D] bg-[#0D1117]"}`}>
                        {mockCheckedTasks["week1-1"] && <Check className="w-3 h-3 text-white stroke-[3.5]" />}
                      </div>
                      <div>
                        <span className={`block font-semibold text-xs ${mockCheckedTasks["week1-1"] ? "line-through text-[#8B949E]" : "text-[#F0F6FC]"}`}>Inspect codebase hierarchy</span>
                        <span className="block text-[11px] text-[#8B949E]">Fork and download entry scripts on the integrated editor tool</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-[#8B949E] text-center">Check items to interactively trigger roadmap state progression.</p>
                </div>
              )}
              {activeMockTab === "issue" && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#8B949E] uppercase font-bold tracking-wider">GEMINI ISSUE EXPLAINER</span>
                    <span className="text-xs text-[#58A6FF] font-mono flex items-center gap-1 font-semibold">
                      <Sparkles className="w-3.5 h-3.5" /> AI translation sandbox
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="bg-[#161B22] border border-[#30363D] p-3 rounded-md">
                      <label htmlFor="mock-translate-input" className="block text-[10px] font-mono uppercase text-[#F85149] font-bold mb-1">Raw Bug Log Input</label>
                      <input
                        id="mock-translate-input"
                        type="text"
                        value={mockTranslateQuery}
                        onChange={(e) => setMockTranslateQuery(e.target.value)}
                        className="w-full bg-[#0D1117] border border-[#30363D] text-xs font-mono text-[#F0F6FC] px-2 py-1.5 rounded focus:outline-none focus:border-[#2F81F7]"
                      />
                    </div>
                    <div className="bg-[#161B22] border border-[#30363D] p-3 rounded-md space-y-1.5 font-mono text-xs">
                      <span className="block text-[10px] uppercase text-[#39D353] font-bold">Gemini Context Parsing</span>
                      <p className="text-[#F0F6FC] font-semibold">Diagnosis: Standard Bootstrap Crash</p>
                      <p className="text-[#8B949E] leading-relaxed">
                        The function <code className="text-[#f78166]">bootstrapTelemetry()</code> tries to load variables but the main workstation config dictionary is missing or unresolved.
                      </p>
                      <div className="text-[11px] text-[#58A6FF] font-semibold flex items-center gap-1 mt-1">
                        <CheckCircle className="w-3.5 h-3.5 text-[#39D353]" /> Action Item: Check environmental config variables in server file.
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeMockTab === "prs" && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#8B949E] uppercase font-bold tracking-wider">ACTIVE WORKSPACE PR FEED</span>
                    <span className="text-xs text-[#39D353] font-mono flex items-center gap-1 select-none font-semibold">
                      <span className="w-1.5 h-1.5 bg-[#238636] rounded-full animate-pulse" aria-hidden="true" /> Sync ok
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="border border-[#124429] bg-[#1f242c]/65 p-3 rounded-md flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-xs text-[#39D353] block">PR #14: Link authorized GitHub signature block</span>
                        <span className="text-[11px] text-[#8B949E] block">Target branch: master &bull; guest-committer</span>
                      </div>
                      <span className="px-2 py-0.5 font-mono bg-[#238636]/20 text-[#39D353] border border-[#238636]/40 rounded text-[10px] font-bold uppercase select-none">Merged</span>
                    </div>
                    <div className="border border-[#30363D] bg-[#161B22] p-3 rounded-md flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-xs text-[#F0F6FC] block">PR #15: Create GPG validation checkpoint signatures</span>
                        <span className="text-[11px] text-[#8B949E] block">WaitMsBeforeAsync verification state completed</span>
                      </div>
                      <span className="px-2 py-0.5 font-mono bg-[#381a54] text-purple-300 border border-purple-900/40 rounded text-[10px] font-bold uppercase select-none">Review</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
