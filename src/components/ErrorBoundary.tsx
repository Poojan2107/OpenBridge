import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in React lifecycle:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center p-6 font-sans">
          <div className="text-center max-w-md w-full bg-[#161b22] border border-[#30363d] rounded-xl p-8 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-950/30 border border-red-900/40 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-xl font-bold">!</span>
            </div>
            <h1 className="text-xl font-bold mb-2 text-zinc-100">Something went wrong</h1>
            <p className="text-zinc-400 text-xs mb-6 leading-relaxed">
              An unexpected error occurred in the application view rendering. You can try restarting
              the session.
            </p>
            <div className="bg-black/30 border border-[#30363d] rounded-lg p-4 mb-6 text-left max-h-40 overflow-y-auto">
              <p className="font-mono text-[11px] text-red-400 break-words whitespace-pre-wrap">
                {this.state.error?.stack || this.state.error?.message}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer select-none shadow-sm"
            >
              Reload Session
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
