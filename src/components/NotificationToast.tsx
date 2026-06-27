import React, { useEffect, useRef, useState } from "react";
import { GitPullRequest, GitMerge, X, CheckCircle, Clock, AlertCircle } from "lucide-react";

export interface ToastNotification {
  id: string;
  type: "PR_UPDATE" | "INFO" | "SUCCESS" | "WARNING";
  title: string;
  message: string;
  timestamp: Date;
  status?: string;
}

interface NotificationToastProps {
  notifications: ToastNotification[];
  onDismiss: (id: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  MERGED: {
    label: "Merged",
    color: "border-emerald-800/60 bg-emerald-950/30",
    icon: <GitMerge className="w-4 h-4 text-emerald-400" />,
  },
  PENDING: {
    label: "Open",
    color: "border-blue-800/60 bg-blue-950/30",
    icon: <Clock className="w-4 h-4 text-blue-400" />,
  },
  VERIFYING: {
    label: "In Review",
    color: "border-amber-800/60 bg-amber-950/30",
    icon: <Clock className="w-4 h-4 text-amber-400" />,
  },
  FAILED: {
    label: "Closed",
    color: "border-red-800/60 bg-red-950/30",
    icon: <AlertCircle className="w-4 h-4 text-red-400" />,
  },
  SUCCESS: {
    label: "Success",
    color: "border-emerald-800/60 bg-emerald-950/30",
    icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  },
};

function Toast({
  notification,
  onDismiss,
}: {
  notification: ToastNotification;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Slide in
    const t = setTimeout(() => setVisible(true), 20);
    // Auto-dismiss after 6s
    timerRef.current = setTimeout(() => handleDismiss(), 6000);
    return () => {
      clearTimeout(t);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(onDismiss, 350);
  };

  const cfg = STATUS_CONFIG[notification.status || notification.type] || STATUS_CONFIG["PENDING"];

  return (
    <div
      className={`
        relative max-w-sm w-full rounded-xl border backdrop-blur-sm shadow-2xl shadow-black/50
        transition-all duration-350 ease-out font-sans
        ${cfg.color}
        ${
          visible && !exiting
            ? "opacity-100 translate-x-0"
            : exiting
              ? "opacity-0 translate-x-8"
              : "opacity-0 translate-x-8"
        }
      `}
    >
      {/* Progress bar auto-dismiss indicator */}
      <div className="absolute top-0 left-0 h-0.5 bg-zinc-600 rounded-t-xl w-full overflow-hidden">
        <div
          className="h-full bg-white/30 animate-[shrink_6s_linear_forwards]"
          style={{ width: "100%" }}
        />
      </div>

      <div className="p-3.5 flex items-start gap-3">
        {/* Icon */}
        <div className="mt-0.5 shrink-0">{cfg.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white leading-tight">{notification.title}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{notification.message}</p>
          <span className="text-[10px] text-zinc-600 font-mono mt-1 block">
            {notification.timestamp.toLocaleTimeString()}
          </span>
        </div>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="shrink-0 p-0.5 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function NotificationToast({ notifications, onDismiss }: NotificationToastProps) {
  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 items-end"
      style={{ maxWidth: "360px" }}
    >
      {notifications.map((n) => (
        <Toast key={n.id} notification={n} onDismiss={() => onDismiss(n.id)} />
      ))}
    </div>
  );
}
