import { useEffect, useRef, useCallback } from "react";

export interface SSEEvent {
  type: string;
  payload: Record<string, unknown>;
}

type SSEHandler = (event: SSEEvent) => void;

/**
 * React hook that connects to the server's SSE endpoint (/api/events)
 * and fires `onEvent` whenever a message is received.
 */
export function useSSE(onEvent: SSEHandler) {
  const esRef = useRef<EventSource | null>(null);
  const handlerRef = useRef<SSEHandler>(onEvent);

  // Keep handler ref fresh on every render
  useEffect(() => {
    handlerRef.current = onEvent;
  }, [onEvent]);

  const connect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
    }

    const es = new EventSource("/api/events");
    esRef.current = es;

    es.addEventListener("message", (e) => {
      try {
        const data: SSEEvent = JSON.parse(e.data);
        handlerRef.current(data);
      } catch {
        // ignore malformed events
      }
    });

    es.addEventListener("connected", () => {
      console.log("[SSE] Connected to /api/events");
    });

    es.onerror = () => {
      // Reconnect after 3 seconds on error
      es.close();
      setTimeout(connect, 3000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, [connect]);
}
