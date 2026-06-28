import { useState } from "react";
import { Layers, ChevronDown, Menu, X, Search } from "lucide-react";
import { GitHubUser } from "../../types";

interface LandingNavProps {
  githubUser: GitHubUser | null;
  onConnectGuest: () => void;
  onConnectGithub: () => void;
  onDisconnectGithub: () => void;
  handleScrollToId: (id: string) => void;
}

export function LandingNav({
  githubUser,
  onConnectGuest,
  onConnectGithub,
  onDisconnectGithub,
  handleScrollToId,
}: LandingNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav
        id="landing-navigation"
        className="sticky top-0 z-50 bg-[#0D1117]/95 border-b border-[#30363D] h-16 flex items-center px-4 md:px-8 backdrop-blur-sm select-none"
      >
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <div className="w-8 h-8 rounded-lg bg-[#161B22] border border-[#30363D] flex items-center justify-center text-[#2F81F7] group-hover:border-[#8B949E] transition-colors">
                <Layers className="w-4 h-4 text-[#2F81F7] transition-transform group-hover:scale-110" />
              </div>
              <span className="font-bold text-lg text-[#F0F6FC] tracking-tight group-hover:text-[#2F81F7] transition-colors">
                OpenBridge
              </span>
            </div>
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
          <div className="hidden md:flex items-center flex-grow max-w-xs xl:max-w-sm mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8B949E]" />
              <input
                type="text"
                placeholder="Discover repositories..."
                aria-label="Search repositories"
                className="w-full bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F0F6FC] placeholder-zinc-500 py-1.5 pl-9 pr-3 focus:outline-none focus:border-[#2F81F7] focus:ring-1 focus:ring-[#2F81F7] transition-colors font-mono"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600 font-mono border border-[#30363D] px-1 rounded">
                /
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {githubUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <img
                    src={githubUser.avatar_url}
                    alt={`${githubUser.login} avatar`}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-[#2F81F7]"
                  />
                  <span className="text-xs font-mono text-[#8B949E] font-semibold">
                    {githubUser.login}
                  </span>
                </div>
                <button
                  onClick={onDisconnectGithub}
                  className="text-xs text-[#D29922] hover:underline cursor-pointer"
                  aria-label="Sign Out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={onConnectGuest}
                className="text-sm font-medium text-[#8B949E] hover:text-[#F0F6FC] transition-colors cursor-pointer"
                aria-label="Sign In as Guest"
              >
                Sign In
              </button>
            )}
            <button
              onClick={onConnectGuest}
              className="bg-[#238636] hover:bg-[#2ea44f] text-white text-xs font-semibold px-3.5 py-1.5 rounded-md border border-[#2ea44f] hover:border-emerald-400 transition-colors shadow-sm cursor-pointer"
              aria-label="Start Demo"
            >
              Start Demo
            </button>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[#8B949E] hover:text-[#F0F6FC] bg-[#161B22] border border-[#30363D] rounded-md"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#0D1117] pt-20 px-4 space-y-4 font-semibold text-lg select-none border-b border-[#30363D] flex flex-col justify-start">
          <button
            className="absolute top-4 right-4 p-2 text-[#8B949E]"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="border-b border-[#30363D] pb-3 text-sm text-[#8B949E]">
            MENU NAVIGATION
          </div>
          {[
            { label: "Product", id: "ob-solution" },
            { label: "Open Source", id: "ob-compliance" },
            { label: "Fellowship", id: "ob-tutorial" },
            { label: "Resources", id: "ob-setup-workstation" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setMobileMenuOpen(false);
                handleScrollToId(item.id);
              }}
              className="text-left py-2 border-b border-[#30363D]/40 text-[#8B949E] hover:text-[#F0F6FC] cursor-pointer bg-transparent border-none"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-6 space-y-3">
            {githubUser ? (
              <div className="flex items-center gap-3 bg-[#161B22] border border-[#30363D] p-3 rounded-lg">
                <img
                  src={githubUser.avatar_url}
                  className="w-8 h-8 rounded-full border border-[#2F81F7]"
                  alt=""
                />
                <span className="text-xs font-mono">{githubUser.login}</span>
                <button onClick={onDisconnectGithub} className="text-xs text-[#D29922] ml-auto">
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onConnectGuest();
                }}
                className="w-full text-center py-2.5 bg-[#161B22] border border-[#30363D] rounded-lg text-sm font-semibold"
                aria-label="Sign In as Guest"
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onConnectGuest();
              }}
              className="w-full text-center py-2.5 bg-[#238636] text-white rounded-lg text-sm font-semibold border border-[#2ea44f]"
            >
              Start Demo
            </button>
          </div>
        </div>
      )}
    </>
  );
}
