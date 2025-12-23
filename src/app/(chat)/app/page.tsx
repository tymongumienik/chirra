"use client";

import { useLuciaContext } from "@/app/libs/lucia-context";
import { useEffect } from "react";
import { useUserStore } from "./scripts/db/who-am-i";
import { useViewStore } from "./scripts/stores/view";
import { LoaderCircle, Plus, Smile } from "lucide-react";
import { FriendTab, useFriendTabStore } from "./scripts/stores/friends-tab";
import { Friend } from "./components/friend";
import { Member } from "./components/member";
import { Message } from "./components/message";
import { ServerSidebar } from "./components/parts/server-sidebar";
import { ChannelSidebar } from "./components/parts/channel-sidebar";
import { FriendsTopBar } from "./components/parts/friends-top-bar";
import { ChannelTopBar } from "./components/parts/channel-top-bar";
import { FriendsAddTab } from "./components/parts/friends-add-tab";

export default () => {
  const lucia = useLuciaContext();

  const fetchUser = useUserStore((s) => s.fetchUser);
  const user = useUserStore((s) => s.user);

  const view = useViewStore((s) => s.view);

  const friendTab = useFriendTabStore((s) => s.friendTab);

  useEffect(() => {
    fetchUser();
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
    <div className="flex h-screen bg-background text-white overflow-hidden inter">
      <ServerSidebar />
      <ChannelSidebar />

      {view === "friends" ? (
        <div className="flex-1 flex flex-col">
          <FriendsTopBar />

          <div className="flex-1 overflow-y-auto">
            {["online", "all", "pending", "blocked"].includes(friendTab) && (
              <div className="py-4">
                {[].map((friend, idx) => (
                  <Friend key={idx} {...friend} />
                ))}
              </div>
            )}

            {friendTab === "add" && <FriendsAddTab />}
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 flex flex-col">
            <ChannelTopBar />

            <div className="flex-1 overflow-y-auto">
              <div className="py-4">
                {[].map((msg, idx) => (
                  <Message key={msg.id} {...msg} />
                ))}
              </div>
            </div>

            <div className="px-4 pb-6">
              <div className="flex items-center gap-4 bg-slate-800 rounded-lg px-4 py-3">
                <button type="button" className="hover:opacity-80">
                  <Plus className="w-6 h-6 text-gray-400" />
                </button>
                <input
                  type="text"
                  className="flex-1 bg-transparent text-gray-200 placeholder-gray-400 outline-none"
                />
                <button type="button" className="hover:opacity-80">
                  <Smile className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          <div className="w-60 bg-card overflow-y-auto">
            <div className="pt-4">
              <div className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Online — {[].filter((m) => m.status === "online").length}
              </div>
              {[]
                .filter((m) => m.status === "online")
                .map((member, idx) => (
                  <Member key={idx} {...member} />
                ))}

              <div className="px-2 mb-2 mt-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Offline — {[].filter((m) => m.status === "offline").length}
              </div>
              {[]
                .filter((m) => m.status === "offline")
                .map((member, idx) => (
                  <Member key={idx} {...member} />
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
