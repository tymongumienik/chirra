"use client";

import { useEffect } from "react";
import { LoadingScreen } from "@/app/libs/loading-screen";
import { useLuciaContext } from "@/app/libs/lucia-context";
import { WebSocketProvider } from "@/app/libs/ws";
import Page from "./components/parts/page";
import { useUserStore } from "./scripts/stores/who-am-i";

export default () => {
  const lucia = useLuciaContext();

  const fetchUser = useUserStore((s) => s.fetchUser);
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    fetchUser();
    const t = setTimeout(fetchUser, 30000);
    return () => clearTimeout(t);
  }, [fetchUser]);

  useEffect(() => {
    if (!lucia.session) {
      window.location.href = "/login"; // hard redirect
    }
  }, [lucia.session]);

  if (!lucia.session) return null;
  if (!user) return <LoadingScreen />;

  return (
    <WebSocketProvider>
      <Page />
    </WebSocketProvider>
  );
};
