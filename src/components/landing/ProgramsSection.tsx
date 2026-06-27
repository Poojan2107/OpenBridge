const programs = [
  {
    id: "prog-gsoc",
    border: "border-l-amber-500",
    label: "text-amber-500",
    labelText: "Google Initiative",
    title: "GSoC",
    desc: "Google Summer of Code connects students with real production mentors. Get paid while learning to manage cloud components.",
  },
  {
    id: "prog-hacktober",
    border: "border-l-teal-400",
    label: "text-teal-400",
    labelText: "DigitalOcean Event",
    title: "Hacktoberfest",
    desc: "A month-long celebration of public coding. Earn badges and ecosystem credit by committing high quality functional improvements.",
  },
  {
    id: "prog-outreachy",
    border: "border-l-rose-400",
    label: "text-rose-400",
    labelText: "Remote Internships",
    title: "Outreachy",
    desc: "Provides 3-month paid remote open source fellowships to marginalized developers looking to break into core infrastructure.",
  },
  {
    id: "prog-lfx",
    border: "border-l-[#2F81F7]",
    label: "text-[#2F81F7]",
    labelText: "Linux Foundation",
    title: "LFX Mentorship",
    desc: "Learn under CNCF, OpenJS, or Linux Kernel leads. Build hyper-scale components while gaining enterprise validation.",
  },
];

export function ProgramsSection() {
  return (
    <section
      id="ob-compliance"
      className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#30363D] select-none text-center sm:text-left"
    >
      <div className="space-y-12">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-mono uppercase text-[#D29922] font-bold tracking-wider">
            Pathways Alignment
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F0F6FC]">
            Supported Open Source Programs
          </h2>
          <p className="text-[#8B949E] text-sm leading-relaxed max-w-xl">
            Become preparation-ready for major institutional initiatives and open developer
            internships. We align milestones perfectly to program timelines.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((p) => (
            <div
              key={p.id}
              className={`bg-[#161B22] border-l-[3px] ${p.border} border border-[#30363D] rounded p-5 space-y-2 hover:bg-[#161B22]/80 transition-colors`}
            >
              <span
                className={`text-[11px] font-mono ${p.label} uppercase font-bold tracking-wider`}
              >
                {p.labelText}
              </span>
              <h4 className="text-base font-bold text-[#F0F6FC]">{p.title}</h4>
              <p className="text-[#8B949E] text-xs leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
