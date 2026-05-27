import React from "react";
import { ExternalLink, Award, Users, BookOpen, Globe, Compass, Cpu } from "lucide-react";
import { OpenSourceProgram } from "../types";

const PROGRAMS: OpenSourceProgram[] = [
  {
    name: "Google Summer of Code",
    description: "A global, online program focused on bringing new contributors into open source software development. Contributors work with mentor organizations on a 12+ week project.",
    timeline: "Applications open annually around March/April",
    tag: "Paid Stipend • Global",
    url: "https://summerofcode.withgoogle.com",
    iconName: "Award"
  },
  {
    name: "Outreachy Mentorship",
    description: "Provides paid, remote, 3-month internships for people who face systemic bias and are underrepresented in the tech industry. Great support system with dedicated mentors.",
    timeline: "Runs twice a year (May-August & Dec-March)",
    tag: "Paid Internship • $7,000 USD",
    url: "https://outreachy.org",
    iconName: "Users"
  },
  {
    name: "LFX Mentorship",
    description: "Supported by the Linux Foundation, LFX allows students and early-career engineers to work on critical open-source projects (like Kubernetes, Node, and hyperledger) with direct guidance.",
    timeline: "Multiple cohorts throughout the year",
    tag: "Industry Standard • Specialized",
    url: "https://mentorship.lfx.linuxfoundation.org",
    iconName: "Cpu"
  },
  {
    name: "MLH Fellowship",
    description: "A remote, 12-week educational program where students and developers collaborate on major real-world open source projects used by millions of developers.",
    timeline: "Fall, Spring, & Summer cohorts available",
    tag: "Educational • Stipends",
    url: "https://fellowship.mlh.io",
    iconName: "Compass"
  },
  {
    name: "Google Season of Docs",
    description: "Pairs open-source organizations with professional technical writers to create top-tier documentation and solve communication challenges in the community.",
    timeline: "Applications open around February annually",
    tag: "Technical Writing • Paid",
    url: "https://developers.google.com/season-of-docs",
    iconName: "BookOpen"
  },
  {
    name: "Hacktoberfest",
    description: "A month-long global celebration of open source software hosted by DigitalOcean. Encourages beginners to make their first four pull requests to any participating project on GitHub.",
    timeline: "Throughout the month of October",
    tag: "Casual • Swag & Tree Planting",
    url: "https://hacktoberfest.com",
    iconName: "Globe"
  }
];

export default function OpportunityLayer() {
  const getIcon = (name: string) => {
    switch (name) {
      case "Award": return <Award className="w-4 h-4 text-zinc-400" />;
      case "Users": return <Users className="w-4 h-4 text-zinc-400" />;
      case "Cpu": return <Cpu className="w-4 h-4 text-zinc-400" />;
      case "Compass": return <Compass className="w-4 h-4 text-zinc-400" />;
      case "BookOpen": return <BookOpen className="w-4 h-4 text-zinc-400" />;
      default: return <Globe className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl p-6 md:p-8 shadow-sm overflow-hidden relative">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
          Ecosystem Fellowships
        </span>
        <h2 className="text-lg font-bold text-zinc-150 tracking-tight mt-1">
          Open Source Programs & Fellowships
        </h2>
        <p className="text-zinc-400 text-xs mt-1 max-w-2xl leading-relaxed">
          Structured mentorship programs, remote internships, and funded cohorts that support onboarding into the open source software landscape.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PROGRAMS.map((program, idx) => (
          <div
            key={idx}
            className="flex flex-col bg-[#090a0f] border border-zinc-90 w-full hover:border-zinc-800 rounded-lg p-5 transition-all duration-150 group"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="p-2 bg-zinc-950 border border-zinc-900 rounded">
                {getIcon(program.iconName)}
              </div>
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900">
                {program.tag}
              </span>
            </div>

            <h3 className="text-sm font-bold text-zinc-200 transition-colors duration-150">
              {program.name}
            </h3>

            <p className="text-zinc-400 text-xs leading-relaxed mt-2 flex-grow font-sans">
              {program.description}
            </p>

            <div className="mt-5 pt-4 border-t border-zinc-90 flex items-center justify-between text-[11px] font-mono">
              <div className="text-zinc-550">
                <span className="block text-[9px] uppercase tracking-wider text-zinc-600 mb-0.5">Timeline</span>
                <span className="text-zinc-400">{program.timeline}</span>
              </div>
              <a
                href={program.url}
                target="_blank"
                rel="noreferrer referrer"
                className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-200 bg-zinc-900 px-2.5 py-1 rounded transition-colors duration-150 shrink-0 border border-zinc-800"
              >
                Website <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
