"use client";

import { useEffect } from "react";
import { connectPresenceSocket, disconnectPresenceSocket } from "@/src/services/socket/presenceSocket";
import { useAppDispatch } from "@/src/store";
import { setPresenceSnapshot, markUserOnline, markUserOffline, clearPresence } from "@/src/store/slices/platformSlice";

/** Mounted once near the app root — owns the presence socket's lifecycle. */
export function usePresence(enabled: boolean) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!enabled) return;

    const socket = connectPresenceSocket();
    const onSnapshot = (payload: { onlineUserIds: string[] }) => dispatch(setPresenceSnapshot(payload));
    const onOnline = (payload: { userId: string }) => dispatch(markUserOnline(payload));
    const onOffline = (payload: { userId: string }) => dispatch(markUserOffline(payload));

    socket.on("presence:snapshot", onSnapshot);
    socket.on("user:online", onOnline);
    socket.on("user:offline", onOffline);

    return () => {
      socket.off("presence:snapshot", onSnapshot);
      socket.off("user:online", onOnline);
      socket.off("user:offline", onOffline);
      disconnectPresenceSocket();
      dispatch(clearPresence());
    };
  }, [enabled, dispatch]);
}
