import { io, type Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

let socket: Socket | null = null;

/**
 * Auth for this handshake rides on the httpOnly `access_token` cookie
 * (withCredentials) — the app never holds a JS-readable token. The backend's
 * presence gateway reads that same cookie when `auth.token` is absent.
 */
export function connectPresenceSocket(): Socket {
  if (socket) return socket;
  socket = io(`${SOCKET_URL}/presence`, {
    withCredentials: true,
    transports: ["polling", "websocket"],
  });
  return socket;
}

export function disconnectPresenceSocket(): void {
  socket?.disconnect();
  socket = null;
}
