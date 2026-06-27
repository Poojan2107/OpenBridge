import { Response } from "express";

export interface SSEClient {
  id: string;
  res: Response;
}

// In-memory store of connected SSE clients
const clients: Map<string, SSEClient> = new Map();

/**
 * Register a new SSE client connection
 */
export function addSSEClient(id: string, res: Response): void {
  clients.set(id, { id, res });
}

/**
 * Remove an SSE client on disconnect
 */
export function removeSSEClient(id: string): void {
  clients.delete(id);
}

/**
 * Broadcast an event to all connected SSE clients
 */
export function broadcastSSEEvent(event: { type: string; payload: Record<string, unknown> }): void {
  const data = JSON.stringify(event);
  clients.forEach((client) => {
    try {
      client.res.write(`event: message\n`);
      client.res.write(`data: ${data}\n\n`);
    } catch {
      // Client disconnected mid-write — clean up
      clients.delete(client.id);
    }
  });
}

/**
 * Send an event to a specific client only
 */
export function sendSSEEventToClient(
  clientId: string,
  event: { type: string; payload: Record<string, unknown> },
): void {
  const client = clients.get(clientId);
  if (!client) return;
  const data = JSON.stringify(event);
  try {
    client.res.write(`event: message\n`);
    client.res.write(`data: ${data}\n\n`);
  } catch {
    clients.delete(clientId);
  }
}

export function getConnectedClientCount(): number {
  return clients.size;
}
