import { io, type Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

let socket: Socket | null = null;
// Reference count — more than one independent owner can hold this shared
// connection open at once (usePresence inside DashboardShell, AND
// AuthGuard's tenant:status-changed listener, which must keep working even
// while DashboardShell is unmounted showing DeactivatedScreen/
// PendingApprovalScreen). The connection only actually tears down once
// EVERY owner has released it — previously a single disconnect() call from
// either owner killed it out from under the other, which is why a
// reactivation pushed while DeactivatedScreen was showing was never
// received: DashboardShell's unmount had already disconnected the socket.
let refCount = 0;

/**
 * Auth for this handshake rides on the httpOnly `access_token` cookie
 * (withCredentials) — the app never holds a JS-readable token. The backend's
 * presence gateway reads that same cookie when `auth.token` is absent.
 */
export function connectPresenceSocket(): Socket {
  refCount += 1;
  if (socket) return socket;
  socket = io(`${SOCKET_URL}/presence`, {
    withCredentials: true,
    transports: ["polling", "websocket"],
  });
  return socket;
}

/** Releases this owner's claim on the shared connection. Only disconnects once every owner has called this. */
export function disconnectPresenceSocket(): void {
  refCount = Math.max(0, refCount - 1);
  if (refCount > 0) return;
  socket?.disconnect();
  socket = null;
}
