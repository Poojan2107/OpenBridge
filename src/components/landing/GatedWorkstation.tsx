import { Shield, Zap, Github, CheckCircle, Award, Code, Terminal, Info } from "lucide-react";
import { GitHubUser, UserProfile } from "../../types";
import ProfilingForm from "../ProfilingForm";

interface GatedWorkstationProps {
  githubUser: GitHubUser | null;
  onConnectGithub: () => void;
  onConnectGuest: () => void;
  onDisconnectGithub: () => void;
  onSubmitProfile: (profile: UserProfile) => void;
  isLoading: boolean;
}

export function GatedWorkstation({
  githubUser,
  onConnectGithub,
  onConnectGuest,
  onDisconnectGithub,
  onSubmitProfile,
  isLoading,
}: GatedWorkstationProps) {
  return (
    <section
      id="ob-setup-workstation"
      className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none border-t border-[#30363D]"
    >
      {!githubUser ? (
        <div
          className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden p-8 md:p-12 relative shadow-2xl"
          id="cyber-gateway-pass"
        >
          <div
            className="absolute -top-10 -right-10 w-64 h-64 bg-[#238636]/10 rounded-full blur-[70px] pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#2f81f7]/10 rounded-full blur-[70px] pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="relative z-10 max-w-4xl mx-auto space-y-8 text-center sm:text-left"
            id="cyber-gate-content"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-[#30363D] pb-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-red-950/30 border border-red-900/40 text-red-400 rounded-md text-xs font-mono uppercase font-bold tracking-wider">
                  <Shield className="w-3.5 h-3.5" /> Secure Session Handshake Required
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F0F6FC]">
                  Gated Workstation Access
                </h2>
              </div>
              <span className="text-xs text-zinc-500 font-mono inline-flex items-center gap-1.5 bg-[#0D1117] border border-[#30363D] px-3 py-1.5 rounded-md">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"
                  aria-hidden="true"
                />{" "}
                Gated Access Mode
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-4 text-left">
                <p className="text-[#8B949E] text-sm leading-relaxed font-mono">
                  OpenBridge leverages your genuine GitHub profile characteristics to automatically
                  customize recommended project pathways, milestones, week-by-week issue translation
                  guides, and preflight security scopes.
                </p>
                <div className="space-y-3.5 mt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-[#2F81F7]/10 text-[#2F81F7] rounded mt-0.5">
                      <Code className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-[#F0F6FC]">
                        Tailored Issue Recommendations
                      </span>
                      <span className="block text-xs text-[#8B949E] mt-0.5">
                        We extract listed topics, public repositories count, and profile statistics
                        to index best-suited issues.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-purple-900/20 text-purple-400 rounded mt-0.5">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-[#F0F6FC]">
                        Personalized Milestone Progress Paths
                      </span>
                      <span className="block text-xs text-[#8B949E] mt-0.5">
                        Our 4-week roadmap is dynamically generated and structured for your current
                        experience.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-5 bg-[#0D1117] border border-[#30363D] p-6 rounded-xl space-y-4">
                <span className="block text-xs font-mono text-[#8B949E] uppercase font-bold text-center tracking-wider mb-2">
                  Get Started
                </span>
                <div className="bg-[#161B22] border border-[#2ea44f]/40 p-4 rounded-md space-y-3">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono text-[11px] uppercase">
                    <Zap className="w-3.5 h-3.5" /> Instant Demo — No Signup Required
                  </div>
                  <p className="text-xs text-[#8B949E] leading-relaxed">
                    Start with a simulated{" "}
                    <strong className="text-[#39D353]">@guest-committer</strong> profile (42 repos,
                    React/TypeScript). All AI features work immediately.
                  </p>
                  <button
                    onClick={onConnectGuest}
                    className="w-full bg-[#238636] hover:bg-[#2ea44f] text-white border border-[#2ea44f] text-xs py-3 px-3 rounded-md font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    aria-label="Launch Demo as Guest Committer"
                  >
                    <Zap className="w-3.5 h-3.5" /> Launch Demo
                  </button>
                </div>
                <div className="relative text-center select-none py-1">
                  <span className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[#30363D]/65" />
                  </span>
                  <span className="relative bg-[#0D1117] px-3 text-xs font-mono uppercase font-bold text-zinc-500">
                    COMING SOON
                  </span>
                </div>
                <button
                  onClick={onConnectGithub}
                  className="w-full bg-[#1F242C] hover:bg-[#30363D] border border-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] text-xs py-2.5 px-4 rounded-md font-mono font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  aria-label="Connect GitHub (in development)"
                >
                  <Github className="w-4 h-4" /> Connect GitHub (pipeline)
                </button>
              </div>
            </div>
            <div className="text-center md:text-left text-xs text-zinc-500 font-mono flex items-center gap-2 justify-center md:justify-start">
              <Info className="w-3.5 h-3.5" />
              <span>
                Redirect Handshake Host Callback:{" "}
                <strong className="text-zinc-400 underline">
                  {window.location.origin}/auth/callback
                </strong>
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
          id="active-profiler-layout"
        >
          <div className="lg:col-span-4 bg-[#161B22] border border-[#30363D] rounded-lg p-5 space-y-5 animate-fade-in shadow-xl">
            <div className="flex items-center gap-2 pb-3.5 border-b border-[#30363D] text-xs font-mono font-bold text-[#8B949E]">
              <Terminal className="w-4 h-4 text-[#39D353]" /> DYNAMIC PROFILE INSIGHTS
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-[#0D1117] p-3 rounded-md border border-[#30363D]">
                <img
                  src={githubUser.avatar_url}
                  className="w-10 h-10 rounded-full border-2 border-[#39D353]"
                  referrerPolicy="no-referrer"
                  alt={`${githubUser.login} avatar`}
                />
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-[#F0F6FC] truncate">
                    @{githubUser.login}
                  </span>
                  <span className="block text-xs text-zinc-500 font-mono truncate">
                    {githubUser.name || "GitHub Developer"}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <span className="block text-xs font-mono uppercase text-[#8B949E] tracking-wider font-bold">
                  Footprint Evaluation
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#0D1117] border border-[#30363D] p-2.5 rounded text-center">
                    <span className="block text-lg font-bold text-[#F0F6FC] font-mono">
                      {githubUser.public_repos || 0}
                    </span>
                    <span className="block text-[11px] text-[#8B949E] font-mono uppercase">
                      Repositories
                    </span>
                  </div>
                  <div className="bg-[#0D1117] border border-[#30363D] p-2.5 rounded text-center">
                    <span className="block text-lg font-bold text-[#F0F6FC] font-mono">
                      {githubUser.followers || 0}
                    </span>
                    <span className="block text-[11px] text-[#8B949E] font-mono uppercase">
                      Followers
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-zinc-950/45 border border-[#30363D] rounded-md space-y-2.5 text-xs">
                <span className="block text-xs font-mono text-[#8B949E] uppercase font-bold tracking-wider">
                  AI Tailoring Diagnostic
                </span>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-[#8B949E]">Reputation Tier:</span>
                  <span className="text-zinc-200 font-bold uppercase">
                    {githubUser.followers > 100 ? "Class-A Leader" : "Rising Starter"}
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-[#8B949E]">OpenBridge Signal:</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#238636]/15 text-[#39D353] text-[11px] font-bold uppercase animate-pulse">
                    Tailoring Ready
                  </span>
                </div>
                <div className="pt-2 border-t border-[#30363D]/65 text-xs text-zinc-500 leading-normal">
                  Our recommendation system automatically feeds your GitHub footprint details into
                  Gemini to suggest highly customized experience pathways.
                </div>
              </div>
              <div className="pt-3 border-t border-[#30363D] flex justify-between items-center text-xs font-mono">
                <span className="text-[#39D353] font-bold flex items-center gap-1">
                  <span
                    className="w-1.5 h-1.5 bg-[#238636] rounded-full animate-pulse"
                    aria-hidden="true"
                  />{" "}
                  Verified handshaked
                </span>
                <button
                  onClick={onDisconnectGithub}
                  className="text-[#f85149] hover:underline cursor-pointer bg-transparent border-none"
                  aria-label="Disconnect session"
                >
                  Disconnect Session
                </button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-8 bg-[#161B22] border border-[#30363D] rounded-lg p-6 space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-[#F0F6FC]">
                Setup Workspace Variables
              </h2>
              <p className="text-[#8B949E] text-sm font-mono leading-relaxed">
                OpenBridge leverages your parameters to dynamically fetch relevant codebase issues
                and synthesize milestones. Select your primary domain, difficulty level, and tools
                below:
              </p>
            </div>
            <ProfilingForm
              onSubmit={onSubmitProfile}
              isLoading={isLoading}
              githubUser={githubUser}
            />
          </div>
        </div>
      )}
    </section>
  );
}
