"use client";

import { useLuciaContext } from "@/app/libs/lucia-context";
import { useContext, useEffect } from "react";
import { useUserStore } from "./scripts/db/who-am-i";
import { useViewStore } from "./scripts/stores/view";
import { LoaderCircle, Plus, Smile } from "lucide-react";
import { useFriendTabStore } from "./scripts/stores/friends-tab";
import { Friend } from "./components/friend";
import { Member } from "./components/member";
import { Message } from "./components/message";
import { ServerSidebar } from "./components/parts/server-sidebar";
import { ChannelSidebar } from "./components/parts/channel-sidebar";
import { FriendsTopBar } from "./components/parts/friends-top-bar";
import { ChannelTopBar } from "./components/parts/channel-top-bar";
import { FriendsAddTab } from "./components/parts/friends-add-tab";
import { WebSocketProvider } from "@/app/libs/ws";
import Page from "./components/parts/page";

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
  if (!user)
    return (
      <div className="min-h-screen bg-background flex justify-center items-center text-4xl text-foreground">
        <LoaderCircle className="animate-spin" />
      </div>
    );

  return (
    <WebSocketProvider>
      <Page />
    </WebSocketProvider>
  );
};
