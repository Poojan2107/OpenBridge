import { Layers } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-[#30363D] bg-[#0D1117] py-12 text-[#8B949E] text-xs font-mono select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-[#2F81F7]" />
          <span className="font-bold text-sm text-[#F0F6FC]">OpenBridge</span>
          <span className="text-[11px] text-zinc-600">© 2026 OpenBridge, Inc.</span>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-xs">
          <a href="https://github.com/opensource/code-of-conduct" target="_blank" rel="noreferrer" className="hover:text-[#2F81F7] transition-colors" aria-label="Code of Conduct">Code of Conduct</a>
          <a href="https://opensource.org" target="_blank" rel="noreferrer" className="hover:text-[#2F81F7] transition-colors" aria-label="OSI Parity Link">OSI Parity</a>
          <a href="#" className="hover:text-[#2F81F7] transition-colors" aria-label="Terms of Use">Terms of Use</a>
          <a href="#" className="hover:text-[#2F81F7] transition-colors" aria-label="Security Controls">Security Controls</a>
        </div>
      </div>
    </footer>
  );
}
