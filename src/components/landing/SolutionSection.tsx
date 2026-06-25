import { Code, MessageSquare, Sparkles, Award } from "lucide-react";

const solutions = [
  {
    id: "sol-match",
    icon: Code,
    iconBg: "bg-[#2F81F7]/15 text-[#2F81F7]",
    title: "AI Repository Matching",
    desc: "Instantly evaluate your active skill-tree against millions of issue logs. We align repository matches to your exact level with pinpoint precision.",
  },
  {
    id: "sol-translate",
    icon: MessageSquare,
    iconBg: "bg-[#39D353]/15 text-[#39D353]",
    title: "Issue Translation",
    desc: "Bypass institutional context. Feed complex maintainer bug reports to Gemini AI to compile direct, structured, step-by-step resolution playbooks.",
  },
  {
    id: "sol-roadmap",
    icon: Sparkles,
    iconBg: "bg-[#D29922]/15 text-[#D29922]",
    title: "Guided Roadmaps",
    desc: "Work through a dynamic 4-week onboarding checklist detailing file inspection, local fork tracing, pre-flight checks, and draft pull request workflows.",
  },
  {
    id: "sol-fellowship",
    icon: Award,
    iconBg: "bg-purple-900/15 text-purple-400",
    title: "Fellowship Discovery",
    desc: "Fast-track your enrollment into premier community pathways including LFX, Hacktoberfest, Google Summer of Code, and Outreachy initiatives.",
  },
];

export function SolutionSection() {
  return (
    <section id="ob-solution" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#30363D] select-none text-center sm:text-left">
      <div className="space-y-12">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-mono uppercase text-[#39D353] font-bold tracking-wider">The OpenBridge Fix</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F0F6FC]">How OpenBridge helps</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.id} className="bg-[#161B22] border border-[#30363D] p-5.5 rounded-lg space-y-3.5 hover:border-[#8B949E]/50 transition-colors">
                <div className={`p-2 rounded mr-auto w-max mx-auto sm:mx-0 ${s.iconBg}`} aria-hidden="true">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#F0F6FC]">{s.title}</h3>
                <p className="text-[#8B949E] text-sm leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
