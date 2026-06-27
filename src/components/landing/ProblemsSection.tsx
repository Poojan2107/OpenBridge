import { Compass, AlertCircle, Terminal } from "lucide-react";

const problems = [
  {
    id: "prob-find",
    icon: Compass,
    iconBg: "bg-[#f85149]/10 border-[#f85149]/20 text-[#f85149]",
    title: "Can't find suitable repositories",
    desc: "Beginners are often crushed by massive codebases where finding a task appropriate for their current level is a needle in a haystack.",
  },
  {
    id: "prob-understand",
    icon: AlertCircle,
    iconBg: "bg-[#D29922]/10 border-[#D29922]/20 text-[#D29922]",
    title: "Don't understand issues",
    desc: "Maintainer descriptions are frequently written for internal teams, using highly institutional terms that leave newcomers completely lost.",
  },
  {
    id: "prob-roadmap",
    icon: Terminal,
    iconBg: "bg-purple-900/20 border-purple-800/25 text-purple-400",
    title: "Lack roadmap guidance",
    desc: "Frictional transitions lead to early abandonment. Without a week-by-week plan, knowing what files to touch or how to run tests is a guessing game.",
  },
];

export function ProblemsSection() {
  return (
    <section
      id="ob-features-struggle"
      className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#30363D] select-none text-center sm:text-left"
    >
      <div className="space-y-12">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-mono uppercase text-[#2F81F7] font-bold tracking-wider">
            Traditional Pain Points
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F0F6FC]">
            Why developers struggle with Open Source
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className="bg-[#161B22] border border-[#30363D] p-6 rounded-lg space-y-4 hover:border-[#8B949E]/70 transition-colors shadow-sm"
              >
                <div
                  className={`p-2.5 border rounded-md w-max mx-auto sm:mx-0 ${p.iconBg}`}
                  aria-hidden="true"
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#F0F6FC]">{p.title}</h3>
                <p className="text-[#8B949E] text-sm leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
