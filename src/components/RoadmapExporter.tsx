import React, { useCallback, useRef, useState } from "react";
import {
  Download,
  X,
  Image,
  FileText,
  CheckCircle2,
  Clock,
  Zap,
  Share2,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { PersonalizedRoadmap, GitHubUser, UserProfile } from "../types";
import { calculateXP, getLevelInfo } from "../lib/levelSystem";

// ── Week meta ─────────────────────────────────────────────────────────────────
const WEEK_META = [
  { key: "week1" as const, label: "Week 1", theme: "Git & Setup", accent: "#3b82f6" },
  { key: "week2" as const, label: "Week 2", theme: "Docs & Tests", accent: "#10b981" },
  { key: "week3" as const, label: "Week 3", theme: "Bug Fixes", accent: "#f59e0b" },
  { key: "week4" as const, label: "Week 4", theme: "PRs & Features", accent: "#8b5cf6" },
];

// ── Canvas renderer — draws the full export card ──────────────────────────────
async function renderToCanvas(
  roadmap: PersonalizedRoadmap,
  checkedTasks: Record<string, boolean>,
  user: GitHubUser | null,
  profile: UserProfile,
  scale = 2,
): Promise<HTMLCanvasElement> {
  const W = 900;
  const H = 600;

  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  // ── Background gradient ───────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0d1117");
  bg.addColorStop(0.5, "#0f172a");
  bg.addColorStop(1, "#0d1117");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid dots
  ctx.fillStyle = "rgba(255,255,255,0.025)";
  for (let x = 20; x < W; x += 28) {
    for (let y = 20; y < H; y += 28) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Ambient glow blobs
  const drawGlow = (cx: number, cy: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  };
  drawGlow(150, 120, 200, "rgba(59,130,246,0.06)");
  drawGlow(750, 480, 180, "rgba(139,92,246,0.06)");

  // ── Outer border ─────────────────────────────────────────────────────────
  ctx.strokeStyle = "#21262d";
  ctx.lineWidth = 1.5;
  roundRect(ctx, 12, 12, W - 24, H - 24, 16);
  ctx.stroke();

  // ── Header area ───────────────────────────────────────────────────────────
  const completedTasks = Object.values(checkedTasks).filter(Boolean).length;
  const totalTasks = Object.values(roadmap).flat().length;
  const mergedPRs = 0; // conservative
  const xp = calculateXP(completedTasks, mergedPRs);
  const level = getLevelInfo(xp);

  // Brand pill
  ctx.fillStyle = "rgba(47,129,247,0.12)";
  roundRect(ctx, 32, 32, 130, 22, 11);
  ctx.fill();
  ctx.fillStyle = "#58a6ff";
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "left";
  ctx.fillText("⬡ OPENBRIDGE", 42, 47);

  // Avatar circle
  const avatarX = 32;
  const avatarY = 68;
  const avatarR = 26;
  ctx.fillStyle = "#1f2937";
  ctx.beginPath();
  ctx.arc(avatarX + avatarR, avatarY + avatarR, avatarR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#30363d";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Avatar initials or load image
  const login = user?.login ?? "GC";
  const initials = login.slice(0, 2).toUpperCase();
  if (user?.avatar_url && !user.simulated) {
    try {
      const img = await loadImage(user.avatar_url);
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarR, avatarY + avatarR, avatarR - 1, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, avatarX + 1, avatarY + 1, (avatarR - 1) * 2, (avatarR - 1) * 2);
      ctx.restore();
    } catch {
      drawInitials(ctx, avatarX + avatarR, avatarY + avatarR, avatarR, initials);
    }
  } else {
    drawInitials(ctx, avatarX + avatarR, avatarY + avatarR, avatarR, initials);
  }

  // Name + username
  ctx.textAlign = "left";
  ctx.fillStyle = "#f0f6fc";
  ctx.font = "bold 18px -apple-system, system-ui, sans-serif";
  ctx.fillText(user?.name || login, 76, 85);
  ctx.fillStyle = "#8b949e";
  ctx.font = "12px monospace";
  ctx.fillText(`@${login} · ${profile.interest} · ${profile.level}`, 76, 102);

  // Level badge pill
  const levelX = 76;
  const levelY = 112;
  ctx.fillStyle = "rgba(139,92,246,0.15)";
  roundRect(ctx, levelX, levelY, 110, 20, 10);
  ctx.fill();
  ctx.strokeStyle = "rgba(139,92,246,0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#a78bfa";
  ctx.font = "bold 10px monospace";
  ctx.fillText(`${level.emoji} ${level.name}  ·  ${xp} XP`, levelX + 8, levelY + 13);

  // ── Header right: stats cluster ───────────────────────────────────────────
  const statItems = [
    { val: `${completedTasks}/${totalTasks}`, lbl: "Tasks Done" },
    { val: `${Math.round((completedTasks / Math.max(totalTasks, 1)) * 100)}%`, lbl: "Complete" },
    { val: `${xp}`, lbl: "XP Earned" },
  ];
  statItems.forEach((s, i) => {
    const sx = W - 260 + i * 90;
    const sy = 68;
    ctx.fillStyle = "#161b22";
    roundRect(ctx, sx, sy, 78, 50, 8);
    ctx.fill();
    ctx.strokeStyle = "#30363d";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#f0f6fc";
    ctx.font = "bold 18px monospace";
    ctx.textAlign = "center";
    ctx.fillText(s.val, sx + 39, sy + 28);
    ctx.fillStyle = "#8b949e";
    ctx.font = "10px monospace";
    ctx.fillText(s.lbl, sx + 39, sy + 42);
  });

  // ── Divider ───────────────────────────────────────────────────────────────
  ctx.strokeStyle = "#21262d";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(32, 152);
  ctx.lineTo(W - 32, 152);
  ctx.stroke();

  // ── Week title ────────────────────────────────────────────────────────────
  ctx.textAlign = "left";
  ctx.fillStyle = "#8b949e";
  ctx.font = "bold 10px monospace";
  ctx.fillText("4-WEEK CONTRIBUTION ROADMAP", 32, 172);

  // ── Week cards grid (2×2) ─────────────────────────────────────────────────
  const cardW = (W - 32 - 32 - 12) / 2;
  const cardH = (H - 192 - 32 - 12) / 2;
  const cols = [32, 32 + cardW + 12];
  const rows = [184, 184 + cardH + 10];

  WEEK_META.forEach(({ key, label, theme, accent }, wi) => {
    const col = wi % 2;
    const row = Math.floor(wi / 2);
    const cx = cols[col];
    const cy = rows[row];

    // Card bg
    ctx.fillStyle = "#161b22";
    roundRect(ctx, cx, cy, cardW, cardH, 10);
    ctx.fill();
    ctx.strokeStyle = "#30363d";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Accent top strip
    ctx.fillStyle = accent + "33"; // 20% opacity
    roundRect(ctx, cx, cy, cardW, 4, 2);
    ctx.fill();
    ctx.fillStyle = accent;
    roundRect(ctx, cx, cy, cardW * 0.5, 4, 2); // progress portion filled
    ctx.fill();

    // Week label
    ctx.fillStyle = accent;
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "left";
    ctx.fillText(label.toUpperCase(), cx + 12, cy + 20);

    ctx.fillStyle = "#f0f6fc";
    ctx.font = "bold 12px -apple-system, system-ui, sans-serif";
    ctx.fillText(theme, cx + 12, cy + 36);

    // Tasks
    const tasks = roadmap[key] ?? [];
    const maxVisible = Math.min(tasks.length, Math.floor((cardH - 50) / 18));
    tasks.slice(0, maxVisible).forEach((task, ti) => {
      const isDone = checkedTasks[`${key}-${ti}`];
      const ty = cy + 50 + ti * 18;

      // Checkbox circle
      ctx.beginPath();
      ctx.arc(cx + 20, ty - 4, 5, 0, Math.PI * 2);
      ctx.fillStyle = isDone ? accent : "#21262d";
      ctx.fill();
      ctx.strokeStyle = isDone ? accent : "#30363d";
      ctx.lineWidth = 1;
      ctx.stroke();

      if (isDone) {
        ctx.strokeStyle = "#0d1117";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + 17, ty - 4);
        ctx.lineTo(cx + 19.5, ty - 1.5);
        ctx.lineTo(cx + 23, ty - 7);
        ctx.stroke();
      }

      // Task text (truncated)
      ctx.fillStyle = isDone ? "#6e7681" : "#c9d1d9";
      ctx.font = `${isDone ? "normal" : "normal"} 10px -apple-system, system-ui, sans-serif`;
      ctx.textAlign = "left";
      const maxWidth = cardW - 42;
      let text = task;
      if (ctx.measureText(text).width > maxWidth) {
        while (ctx.measureText(text + "…").width > maxWidth && text.length > 0) {
          text = text.slice(0, -1);
        }
        text += "…";
      }
      ctx.fillText(text, cx + 32, ty - 1);
    });

    if (tasks.length > maxVisible) {
      ctx.fillStyle = "#8b949e";
      ctx.font = "10px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`+${tasks.length - maxVisible} more`, cx + 32, cy + 50 + maxVisible * 18 - 1);
    }

    // Progress footer
    const done = tasks.filter((_, i) => checkedTasks[`${key}-${i}`]).length;
    const pct = tasks.length > 0 ? done / tasks.length : 0;
    const footerY = cy + cardH - 20;
    ctx.fillStyle = "#0d1117";
    roundRect(ctx, cx + 12, footerY, cardW - 24, 8, 4);
    ctx.fill();
    ctx.fillStyle = accent + "40";
    roundRect(ctx, cx + 12, footerY, cardW - 24, 8, 4);
    ctx.fill();
    if (pct > 0) {
      ctx.fillStyle = accent;
      roundRect(ctx, cx + 12, footerY, Math.max((cardW - 24) * pct, 8), 8, 4);
      ctx.fill();
    }
    ctx.fillStyle = "#8b949e";
    ctx.font = "9px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`${done}/${tasks.length}`, cx + cardW - 12, footerY - 4);
  });

  // ── Footer ─────────────────────────────────────────────────────────────────
  const fy = H - 22;
  ctx.fillStyle = "#484f58";
  ctx.font = "9px monospace";
  ctx.textAlign = "left";
  ctx.fillText(
    `Generated by OpenBridge · ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
    32,
    fy,
  );
  ctx.textAlign = "right";
  ctx.fillText("openbridge.dev", W - 32, fy);

  return canvas;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawInitials(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  text: string,
) {
  const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, "#238636");
  g.addColorStop(1, "#2ea44f");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${r * 0.8}px -apple-system, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cx, cy);
  ctx.textBaseline = "alphabetic";
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ── Print PDF helper ──────────────────────────────────────────────────────────
function printAsPDF(
  roadmap: PersonalizedRoadmap,
  checkedTasks: Record<string, boolean>,
  user: GitHubUser | null,
  profile: UserProfile,
) {
  const login = user?.login ?? "guest-committer";
  const completedTasks = Object.values(checkedTasks).filter(Boolean).length;
  const totalTasks = Object.values(roadmap).flat().length;
  const xp = calculateXP(completedTasks, 0);
  const level = getLevelInfo(xp);

  const weekRows = WEEK_META.map(({ key, label, theme, accent }) => {
    const tasks = roadmap[key] ?? [];
    const taskRows = tasks
      .map((t, i) => {
        const done = checkedTasks[`${key}-${i}`];
        return `<div class="task ${done ? "done" : ""}">
        <span class="dot" style="background:${done ? accent : "#30363d"}"></span>
        <span>${t}</span>
      </div>`;
      })
      .join("");
    const done = tasks.filter((_, i) => checkedTasks[`${key}-${i}`]).length;
    const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
    return `
      <div class="week-card">
        <div class="week-strip" style="background:${accent}"></div>
        <div class="week-header">
          <span class="week-label" style="color:${accent}">${label.toUpperCase()}</span>
          <span class="week-theme">${theme}</span>
        </div>
        <div class="tasks">${taskRows}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%;background:${accent}"></div>
        </div>
        <span class="progress-label">${done}/${tasks.length} · ${pct}%</span>
      </div>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>OpenBridge Roadmap — @${login}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    background: #0d1117;
    color: #f0f6fc;
    padding: 32px;
    min-height: 100vh;
  }
  .card {
    max-width: 860px;
    margin: 0 auto;
    background: #0d1117;
    border: 1px solid #21262d;
    border-radius: 16px;
    padding: 32px;
  }
  .brand { color: #58a6ff; font-size: 11px; font-family: monospace; font-weight: bold; margin-bottom: 16px; }
  .profile { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
  .avatar {
    width: 52px; height: 52px; border-radius: 50%;
    background: linear-gradient(135deg,#238636,#2ea44f);
    display: flex; align-items: center; justify-content: center;
    font-weight: bold; font-size: 18px; color: #fff; border: 2px solid #30363d; overflow: hidden;
  }
  .avatar img { width: 100%; height: 100%; object-fit: cover; }
  .name { font-size: 20px; font-weight: 800; }
  .sub { color: #8b949e; font-size: 12px; font-family: monospace; margin-top: 2px; }
  .badge {
    display: inline-block; margin-top: 6px;
    padding: 3px 10px; border-radius: 20px;
    background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.4);
    color: #a78bfa; font-size: 10px; font-family: monospace; font-weight: bold;
  }
  .stats { display: flex; gap: 12px; margin-left: auto; }
  .stat {
    text-align: center; background: #161b22; border: 1px solid #30363d;
    border-radius: 8px; padding: 10px 16px; min-width: 72px;
  }
  .stat-val { font-size: 20px; font-weight: 900; font-family: monospace; }
  .stat-lbl { font-size: 10px; color: #8b949e; font-family: monospace; margin-top: 2px; }
  .divider { border: none; border-top: 1px solid #21262d; margin: 24px 0 16px; }
  .section-title { font-size: 10px; font-family: monospace; font-weight: bold; color: #8b949e; margin-bottom: 16px; letter-spacing: .06em; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .week-card {
    background: #161b22; border: 1px solid #30363d;
    border-radius: 10px; overflow: hidden; padding: 0;
  }
  .week-strip { height: 4px; }
  .week-header { padding: 12px 14px 6px; }
  .week-label { font-size: 10px; font-family: monospace; font-weight: bold; display: block; }
  .week-theme { font-size: 13px; font-weight: 700; display: block; margin-top: 2px; }
  .tasks { padding: 6px 14px; }
  .task { display: flex; align-items: flex-start; gap: 8px; font-size: 11px; padding: 3px 0; color: #c9d1d9; line-height: 1.4; }
  .task.done { color: #6e7681; text-decoration: line-through; }
  .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; }
  .progress-bar { height: 6px; background: #0d1117; margin: 8px 14px 0; border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
  .progress-label { display: block; font-size: 9px; font-family: monospace; color: #8b949e; text-align: right; padding: 4px 14px 10px; }
  .footer { margin-top: 24px; display: flex; justify-content: space-between; font-size: 10px; color: #484f58; font-family: monospace; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #0d1117; }
    .card { border: none; }
  }
</style>
</head>
<body>
<div class="card">
  <div class="brand">⬡ OPENBRIDGE</div>
  <div class="profile">
    <div class="avatar">
      ${user?.avatar_url && !user.simulated ? `<img src="${user.avatar_url}" crossorigin="anonymous">` : login.slice(0, 2).toUpperCase()}
    </div>
    <div>
      <div class="name">${user?.name || login}</div>
      <div class="sub">@${login} · ${profile.interest} · ${profile.level}</div>
      <div class="badge">${level.emoji} ${level.name} · ${xp} XP</div>
    </div>
    <div class="stats">
      <div class="stat"><div class="stat-val">${completedTasks}/${totalTasks}</div><div class="stat-lbl">Tasks</div></div>
      <div class="stat"><div class="stat-val">${Math.round((completedTasks / Math.max(totalTasks, 1)) * 100)}%</div><div class="stat-lbl">Done</div></div>
      <div class="stat"><div class="stat-val">${xp}</div><div class="stat-lbl">XP</div></div>
    </div>
  </div>
  <hr class="divider">
  <div class="section-title">4-WEEK CONTRIBUTION ROADMAP</div>
  <div class="grid">${weekRows}</div>
  <div class="footer">
    <span>Generated by OpenBridge · ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
    <span>openbridge.dev</span>
  </div>
</div>
<script>window.onload = () => { window.print(); }<\/script>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) {
    alert("Please allow pop-ups to export PDF.");
    return;
  }
  win.document.write(html);
  win.document.close();
}

// ── Main component ────────────────────────────────────────────────────────────
interface RoadmapExporterProps {
  roadmap: PersonalizedRoadmap;
  checkedTasks: Record<string, boolean>;
  githubUser: GitHubUser | null;
  profile: UserProfile;
  onClose: () => void;
}

export default function RoadmapExporter({
  roadmap,
  checkedTasks,
  githubUser,
  profile,
  onClose,
}: RoadmapExporterProps) {
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState<"png" | "pdf" | null>(null);
  const [copied, setCopied] = useState(false);

  const login = githubUser?.login ?? "guest-committer";
  const completedTasks = Object.values(checkedTasks).filter(Boolean).length;
  const totalTasks = Object.values(roadmap).flat().length;
  const xp = calculateXP(completedTasks, 0);
  const level = getLevelInfo(xp);

  const exportPNG = useCallback(async () => {
    setExporting(true);
    try {
      const canvas = await renderToCanvas(roadmap, checkedTasks, githubUser, profile, 2);
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `openbridge-roadmap-${login}.png`;
      a.click();
      setDone("png");
      setTimeout(() => setDone(null), 3000);
    } catch (e) {
      console.error("PNG export failed:", e);
    } finally {
      setExporting(false);
    }
  }, [roadmap, checkedTasks, githubUser, profile, login]);

  const exportPDF = useCallback(() => {
    printAsPDF(roadmap, checkedTasks, githubUser, profile);
    setDone("pdf");
    setTimeout(() => setDone(null), 3000);
  }, [roadmap, checkedTasks, githubUser, profile]);

  const copyShareText = useCallback(() => {
    const pct = Math.round((completedTasks / Math.max(totalTasks, 1)) * 100);
    const text = `🚀 My OpenBridge progress: ${completedTasks}/${totalTasks} tasks complete (${pct}%) — ${level.emoji} ${level.name} level with ${xp} XP! Building my open-source journey one PR at a time. #OpenSource #OpenBridge`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [completedTasks, totalTasks, xp, level]);

  // ── Live preview ──────────────────────────────────────────────────────────
  const pctTotal = Math.round((completedTasks / Math.max(totalTasks, 1)) * 100);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-[#0d1117] border border-[#30363d] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#21262d]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-950/30 border border-blue-800/40">
              <Download className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Export Roadmap</h2>
              <p className="text-[10px] text-zinc-500 font-mono">Download as PNG or PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#21262d] rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview card */}
        <div className="p-6 space-y-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-600/5 rounded-full blur-[40px] pointer-events-none" />

            {/* Profile row */}
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                {githubUser?.avatar_url && !githubUser.simulated ? (
                  <img
                    src={githubUser.avatar_url}
                    referrerPolicy="no-referrer"
                    alt={login}
                    className="w-12 h-12 rounded-full border-2 border-[#30363d]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center font-bold text-white border-2 border-[#30363d]">
                    {login.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 text-base">{level.emoji}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-zinc-100">{githubUser?.name || login}</p>
                <p className="text-[11px] text-zinc-500 font-mono">
                  @{login} · {profile.interest}
                </p>
                <div
                  className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${level.bgColor} ${level.borderColor} ${level.textColor}`}
                >
                  {level.name} · {xp} XP
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {[
                  { v: `${completedTasks}/${totalTasks}`, l: "Tasks" },
                  { v: `${pctTotal}%`, l: "Done" },
                  { v: `${xp}`, l: "XP" },
                ].map(({ v, l }) => (
                  <div
                    key={l}
                    className="text-center bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-2 min-w-[52px]"
                  >
                    <div className="text-sm font-black text-white font-mono">{v}</div>
                    <div className="text-[9px] text-zinc-600 font-mono">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Week grid preview */}
            <div className="grid grid-cols-2 gap-2 relative z-10">
              {WEEK_META.map(({ key, label, theme, accent }) => {
                const tasks = roadmap[key] ?? [];
                const done = tasks.filter((_, i) => checkedTasks[`${key}-${i}`]).length;
                const pct = tasks.length > 0 ? (done / tasks.length) * 100 : 0;
                return (
                  <div
                    key={key}
                    className="bg-[#0d1117] border border-[#21262d] rounded-lg overflow-hidden"
                  >
                    <div className="h-0.5 w-full" style={{ background: accent + "66" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: accent }}
                      />
                    </div>
                    <div className="p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-mono font-bold" style={{ color: accent }}>
                          {label.toUpperCase()}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-600">
                          {done}/{tasks.length}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-zinc-300 mb-1">{theme}</p>
                      <div className="space-y-0.5">
                        {tasks.slice(0, 3).map((t, ti) => {
                          const isDone = checkedTasks[`${key}-${ti}`];
                          return (
                            <div key={ti} className="flex items-center gap-1.5">
                              {isDone ? (
                                <CheckCircle2
                                  className="w-2.5 h-2.5 shrink-0"
                                  style={{ color: accent }}
                                />
                              ) : (
                                <Clock className="w-2.5 h-2.5 text-zinc-700 shrink-0" />
                              )}
                              <span
                                className={`text-[9px] font-mono truncate ${isDone ? "text-zinc-600 line-through" : "text-zinc-400"}`}
                              >
                                {t}
                              </span>
                            </div>
                          );
                        })}
                        {tasks.length > 3 && (
                          <span className="text-[8px] font-mono text-zinc-700">
                            +{tasks.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer line */}
            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-700 pt-1 border-t border-[#21262d] relative z-10">
              <span>
                Generated by OpenBridge ·{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>openbridge.dev</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={exportPNG}
              disabled={exporting}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-blue-800/50 bg-blue-950/20 hover:bg-blue-950/40 text-blue-400 hover:text-blue-300 text-sm font-semibold transition-all disabled:opacity-60"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Rendering…
                </>
              ) : done === "png" ? (
                <>
                  <Check className="w-4 h-4" /> Downloaded!
                </>
              ) : (
                <>
                  <Image className="w-4 h-4" /> Download PNG
                </>
              )}
            </button>

            <button
              onClick={exportPDF}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-violet-800/50 bg-violet-950/20 hover:bg-violet-950/40 text-violet-400 hover:text-violet-300 text-sm font-semibold transition-all"
            >
              {done === "pdf" ? (
                <>
                  <Check className="w-4 h-4" /> Print ready!
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" /> Export PDF
                </>
              )}
            </button>

            <button
              onClick={copyShareText}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-emerald-800/50 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 hover:text-emerald-300 text-sm font-semibold transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Post Text
                </>
              )}
            </button>
          </div>

          <p className="text-[10px] font-mono text-zinc-600 text-center">
            PNG exports at 2× resolution (1800×1200px) · PDF opens browser print dialog
          </p>
        </div>
      </div>
    </div>
  );
}
