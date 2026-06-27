import React, { useState, useEffect } from "react";
import { UserProfile, GitHubUser } from "../types";
import {
  Terminal,
  Code,
  Server,
  BrainCircuit,
  Cpu,
  ArrowRight,
  Sparkles,
  Plus,
  X,
  Loader2,
  Github,
} from "lucide-react";

interface ProfilingFormProps {
  onSubmit: (profile: UserProfile) => void;
  isLoading: boolean;
  githubUser?: GitHubUser | null;
}

const PRESET_SKILLS = [
  "React",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "HTML/CSS",
  "Tailwind CSS",
  "Docker",
  "Git/GitHub",
  "Go",
  "Rust",
  "C++",
  "Java",
  "PostgreSQL",
  "MongoDB",
];

const INTERESTS = [
  {
    id: "Frontend",
    label: "Frontend Development",
    icon: Code,
    desc: "User interfaces, responsive design, animations & state flow.",
  },
  {
    id: "Backend",
    label: "Backend Systems",
    icon: Server,
    desc: "Databases, APIs, caching, server logic & background microservices.",
  },
  {
    id: "Fullstack",
    label: "Fullstack Engineering",
    icon: Cpu,
    desc: "End-to-end applications bridging interactive design and fast API services.",
  },
  {
    id: "AI / Machine Learning",
    label: "AI & Machine Learning",
    icon: BrainCircuit,
    desc: "Neural networks, data pipelines, model integration & LLMs context.",
  },
  {
    id: "DevOps / Infrastructure",
    label: "DevOps & Infrastructure",
    icon: Terminal,
    desc: "Virtualization, CI/CD orchestration scripts, systems health & security.",
  },
] as const;

export default function ProfilingForm({ onSubmit, isLoading, githubUser }: ProfilingFormProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "React",
    "TypeScript",
    "Git/GitHub",
  ]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<UserProfile["level"]>("Beginner");
  const [interestArea, setInterestArea] = useState<UserProfile["interest"]>("Frontend");
  const [detectedSkills, setDetectedSkills] = useState<string[]>([]);
  const [detectingSkills, setDetectingSkills] = useState(false);

  // Auto-detect skills from GitHub repos
  useEffect(() => {
    if (githubUser && !githubUser.simulated) {
      setDetectingSkills(true);
      fetch(`/api/github/skills/${githubUser.login}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.skills && data.skills.length > 0) {
            setDetectedSkills(data.skills);
            setSelectedSkills((prev) => {
              const merged = Array.from(new Set([...data.skills, ...prev]));
              return merged.slice(0, 10);
            });
          }
        })
        .catch(() => {
          /* fallback to bio parsing */
        })
        .finally(() => setDetectingSkills(false));
    }
  }, [githubUser?.login]);

  useEffect(() => {
    if (githubUser) {
      const bioText = (githubUser.bio || "").toLowerCase();
      const skillsToSelect = new Set<string>(["Git/GitHub"]);

      // Smart parse user bio to map relevant languages or frameworks
      if (bioText.includes("react")) skillsToSelect.add("React");
      if (bioText.includes("typescript") || bioText.includes("ts"))
        skillsToSelect.add("TypeScript");
      if (bioText.includes("javascript") || bioText.includes("js"))
        skillsToSelect.add("JavaScript");
      if (bioText.includes("node")) skillsToSelect.add("Node.js");
      if (bioText.includes("python")) skillsToSelect.add("Python");
      if (bioText.includes("css") || bioText.includes("tailwind"))
        skillsToSelect.add("Tailwind CSS");
      if (bioText.includes("docker")) skillsToSelect.add("Docker");
      if (bioText.includes("go")) skillsToSelect.add("Go");
      if (bioText.includes("rust")) skillsToSelect.add("Rust");
      if (bioText.includes("postgres")) skillsToSelect.add("PostgreSQL");
      if (bioText.includes("mongo")) skillsToSelect.add("MongoDB");

      // In case no specific words matched, populate solid premium defaults
      if (skillsToSelect.size <= 1) {
        skillsToSelect.add("React");
        skillsToSelect.add("TypeScript");
        skillsToSelect.add("Tailwind CSS");
      }

      setSelectedSkills(Array.from(skillsToSelect));

      // Auto-detect focus interest domain
      if (
        bioText.includes("backend") ||
        bioText.includes("api") ||
        bioText.includes("database") ||
        bioText.includes("server")
      ) {
        setInterestArea("Backend");
      } else if (
        bioText.includes("ml") ||
        bioText.includes("ai") ||
        bioText.includes("data") ||
        bioText.includes("learning")
      ) {
        setInterestArea("AI / Machine Learning");
      } else if (
        bioText.includes("devops") ||
        bioText.includes("infrastructure") ||
        bioText.includes("kubernetes") ||
        bioText.includes("ci/cd")
      ) {
        setInterestArea("DevOps / Infrastructure");
      } else if (
        bioText.includes("fullstack") ||
        bioText.includes("full-stack") ||
        bioText.includes("end-to-end")
      ) {
        setInterestArea("Fullstack");
      } else {
        setInterestArea("Frontend");
      }

      // Auto-detect perfect experience milestone category
      const repCount = githubUser.public_repos || 0;
      const folCount = githubUser.followers || 0;
      if (repCount > 50 || folCount > 150) {
        setExperienceLevel("Advanced");
      } else if (repCount > 15 || folCount > 40) {
        setExperienceLevel("Intermediate");
      } else {
        setExperienceLevel("Beginner");
      }
    }
  }, [githubUser]);

  const togglePresetSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = customSkillInput.trim();
    if (cleanInput && !selectedSkills.some((s) => s.toLowerCase() === cleanInput.toLowerCase())) {
      setSelectedSkills([...selectedSkills, cleanInput]);
      setCustomSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      skills: selectedSkills,
      level: experienceLevel,
      interest: interestArea,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Container header with simple sleek border layout */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 shadow-md max-w-4xl mx-auto">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-zinc-900 border border-zinc-800 rounded mt-0.5 shrink-0">
            <Code className="w-5 h-5 text-zinc-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-150 tracking-tight">
              Configure Your Developer Profile
            </h3>
            <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
              OpenBridge aligns recommended components to your expertise. Select your comfortable
              difficulty threshold, preferred workspace tools, and focus domains to generate
              optimized project onboarding pathways.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-4xl mx-auto">
        {/* Left column – level and skills */}
        <div className="lg:col-span-6 space-y-6">
          {/* Level selection */}
          <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 shadow-sm">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Experience Threshold
            </label>
            <div className="grid grid-cols-3 gap-1 bg-[#090a0f] p-1 rounded border border-zinc-900">
              {(["Beginner", "Intermediate", "Advanced"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setExperienceLevel(lvl)}
                  className={`py-1.5 px-3 rounded text-xs font-mono font-semibold transition-all duration-150 ${
                    experienceLevel === lvl
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <div className="mt-2.5 text-[10px] text-zinc-500 font-mono">
              {experienceLevel === "Beginner" &&
                "Requires: entry-level documentation, installation guidelines, or basic tests."}
              {experienceLevel === "Intermediate" &&
                "Requires: logical modules, testing suites, or intermediate features."}
              {experienceLevel === "Advanced" &&
                "Requires: performance tuning, security refactors, or logical engines."}
            </div>
          </div>

          {/* Skills multi-select */}
          <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Workspace Toolset
              </label>
              <p className="text-zinc-500 text-[11px] mt-1 leading-relaxed">
                Register the languages, frameworks, or developer utilities you feel comfortable
                navigating.
              </p>
            </div>

            {/* Auto-detection status banner */}
            {githubUser && !githubUser.simulated && (
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[11px] font-mono transition-all ${
                  detectingSkills
                    ? "border-blue-900/40 bg-blue-950/20 text-blue-400"
                    : detectedSkills.length > 0
                      ? "border-emerald-900/40 bg-emerald-950/15 text-emerald-400"
                      : "border-zinc-900 bg-zinc-950/40 text-zinc-500"
                }`}
              >
                {detectingSkills ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin shrink-0" /> Scanning your GitHub repos
                    for languages…
                  </>
                ) : detectedSkills.length > 0 ? (
                  <>
                    <Github className="w-3 h-3 shrink-0" /> Auto-detected {detectedSkills.length}{" "}
                    skills from your {githubUser.public_repos} repos
                  </>
                ) : (
                  <>
                    <Github className="w-3 h-3 shrink-0" /> Connect GitHub to auto-detect skills
                    from your repos
                  </>
                )}
              </div>
            )}

            {/* Current Selection tags */}
            <div className="flex flex-wrap gap-1 bg-[#090a0f] p-2 rounded border border-zinc-900 min-h-[44px]">
              {selectedSkills.length === 0 ? (
                <span className="text-[11px] text-zinc-650 py-0.5 italic">No skills selected</span>
              ) : (
                selectedSkills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-350 font-mono text-[11px]"
                  >
                    {sk}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(sk)}
                      className="text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Presets Grid */}
            <div className="space-y-1.5">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-600">
                Quick Configs
              </span>
              <div className="flex flex-wrap gap-1 max-h-[140px] overflow-y-auto pr-1">
                {PRESET_SKILLS.map((sk) => {
                  const active = selectedSkills.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => togglePresetSkill(sk)}
                      className={`px-2 py-0.5 text-xs rounded transition-all duration-150 font-mono border ${
                        active
                          ? "bg-zinc-800 border-zinc-750 text-white"
                          : "bg-transparent border-zinc-900 hover:border-zinc-805 text-zinc-450 hover:text-zinc-300"
                      }`}
                    >
                      {active ? "✓ " : ""}
                      {sk}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom skill adder */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                placeholder="Register alternative (e.g. SQLite, Rust)"
                className="flex-grow bg-[#090a0f] border border-zinc-900 rounded px-2.5 py-1 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 font-mono"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddCustomSkill(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-750 px-3 py-1 rounded text-xs font-semibold text-zinc-200 transition-all flex items-center gap-1 font-mono"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Right column – area of interest */}
        <div className="lg:col-span-6 space-y-4 bg-zinc-950/45 border border-zinc-900 rounded-xl p-5 shadow-sm">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Primary Focus Domain
          </label>
          <p className="text-zinc-500 text-[11px] leading-relaxed mb-4">
            Select the specialization area you want recommended issues indexed for:
          </p>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {INTERESTS.map((area) => {
              const active = interestArea === area.id;
              const IconComp = area.icon;
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => setInterestArea(area.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all duration-150 ${
                    active
                      ? "bg-zinc-900 border-zinc-700"
                      : "bg-[#090a0f] border-zinc-90 w-full hover:border-zinc-800"
                  }`}
                >
                  <div
                    className={`p-2 rounded border shrink-0 ${
                      active
                        ? "bg-zinc-800 border-zinc-700 text-white"
                        : "bg-zinc-950 border-zinc-900 text-zinc-500"
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <span
                      className={`block text-xs font-bold leading-none ${active ? "text-zinc-150" : "text-zinc-300"}`}
                    >
                      {area.label}
                    </span>
                    <span className="block text-[11px] text-zinc-500 mt-1 leading-normal">
                      {area.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={isLoading || selectedSkills.length === 0}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-200 hover:bg-white disabled:bg-zinc-900 border border-zinc-300 disabled:border-zinc-800 text-zinc-950 disabled:text-zinc-600 rounded text-xs font-mono font-bold uppercase tracking-wider transition-all duration-150 disabled:shadow-none cursor-pointer focus:outline-none"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-zinc-950 rounded-full animate-spin"></span>
              Generating Profile Recommendations...
            </>
          ) : (
            <>
              Generate Recommendations & Roadmap
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
