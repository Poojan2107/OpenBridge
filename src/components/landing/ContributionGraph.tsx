import { useRef } from "react";

function getSimulatedContributionData(): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < 7; r++) {
    grid.push(new Array(53).fill(0));
  }
  const letterPatterns: Record<string, [number, number][]> = {
    O: [
      [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 0], [1, 4], [2, 0], [2, 4], [3, 0], [3, 4], [4, 0], [4, 4], [5, 0], [5, 4], [6, 0], [6, 1], [6, 2], [6, 3], [6, 4],
    ],
    P: [
      [0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 4], [2, 0], [2, 4], [3, 0], [3, 1], [3, 2], [3, 3], [4, 0], [5, 0], [6, 0],
    ],
    E: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 0], [2, 0], [2, 1], [2, 2], [3, 0], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [5, 0], [6, 0]],
    N: [[0, 0], [0, 4], [1, 0], [1, 1], [1, 4], [2, 0], [2, 2], [2, 4], [3, 0], [3, 3], [3, 4], [4, 0], [4, 4], [5, 0], [5, 4], [6, 0], [6, 4]],
    B: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 4], [2, 0], [2, 3], [3, 0], [3, 1], [3, 2], [4, 0], [4, 4], [5, 0], [5, 4], [6, 0], [6, 1], [6, 2], [6, 3]],
    R: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 4], [2, 0], [2, 4], [3, 0], [3, 1], [3, 2], [3, 3], [4, 0], [4, 2], [5, 0], [5, 3], [6, 0], [6, 4]],
    I: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 0], [6, 1], [6, 2], [6, 3], [6, 4]],
    D: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 4], [2, 0], [2, 4], [3, 0], [3, 4], [4, 0], [4, 4], [5, 0], [5, 4], [6, 0], [6, 1], [6, 2], [6, 3]],
    G: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 0], [2, 0], [3, 0], [3, 2], [3, 3], [3, 4], [4, 0], [4, 4], [5, 0], [5, 4], [6, 0], [6, 1], [6, 2], [6, 3], [6, 4]],
    H: [[0, 0], [0, 4], [1, 0], [1, 4], [2, 0], [2, 4], [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [4, 0], [4, 4], [5, 0], [5, 4], [6, 0], [6, 4]],
  };
  const word = "OPENBRIDGE";
  const letterSpacing = 6;
  const startCol = 2;
  word.split("").forEach((ch, idx) => {
    const pattern = letterPatterns[ch];
    if (!pattern) { return; }
    const offset = startCol + idx * letterSpacing;
    pattern.forEach(([r, c]) => {
      const col = offset + c;
      if (col < 53) {
        grid[r][col] = Math.floor(Math.random() * 4) + 1;
      }
    });
  });
  return grid;
}

const intensityColors = [
  "bg-[#161B22]",
  "bg-[#0e4429]",
  "bg-[#006d32]",
  "bg-[#26a641]",
  "bg-[#39d353]",
];

export function ContributionGraph() {
  const contribGrid = useRef(getSimulatedContributionData());

  return (
    <section id="ob-tutorial" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#30363D] select-none text-center sm:text-left">
      <div className="space-y-12">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-mono uppercase text-[#39D353] font-bold tracking-wider">Telemetry Statistics</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F0F6FC]">Interactive Contribution Wave</h2>
          <p className="text-[#8B949E] text-sm leading-relaxed max-w-xl">Your real-time developer pulse. Every checkmark ticked on a roadmap translates to active, visible progress on your telemetry dashboard.</p>
        </div>
        <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="block text-xs font-mono text-[#8B949E] uppercase font-bold">Workspace commit metrics</span>
              <span className="block text-lg font-bold text-[#F0F6FC]">412 contributions in the last year</span>
            </div>
            <div className="text-xs font-mono text-[#8B949E] space-y-1 sm:text-right">
              <span className="block">Active velocity: <strong className="text-[#39D353]">+14 commits this week</strong></span>
              <span className="block">GPG Keys Registered: <strong className="text-[#39D353]">✓ Active</strong></span>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-none py-2 bg-[#0D1117] border border-[#30363D] rounded-lg p-5" role="img" aria-label="Contribution heatmap showing 412 contributions over the past year">
            <div className="min-w-[650px] space-y-1.5 cursor-crosshair">
              {contribGrid.current.map((cols, rowIndex) => (
                <div key={rowIndex} className="flex gap-1">
                  {cols.map((intensity, colIndex) => (
                    <div
                      key={colIndex}
                      className={`w-3 h-3 rounded-[2px] transition-all hover:scale-125 hover:border hover:border-white/40 ${intensityColors[intensity] || intensityColors[0]}`}
                      title={`Contributions level ${intensity}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-[#8B949E]">
            <span>Learn how telemetry works</span>
            <div className="flex items-center gap-1">
              <span>Less</span>
              {intensityColors.map((color, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-[2px] ${color}`} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
