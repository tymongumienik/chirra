import { Plus, Smile } from "lucide-react";
import { Friend } from "../friend";
import { Member } from "../member";
import { Message } from "../message";
import { ChannelSidebar } from "./channel-sidebar";
import { ChannelTopBar } from "./channel-top-bar";
import { FriendsAddTab } from "./friends-add-tab";
import { FriendsTopBar } from "./friends-top-bar";
import { ServerSidebar } from "./server-sidebar";
import { useFriendTabStore } from "../../scripts/stores/friends-tab";
import { useViewStore } from "../../scripts/stores/view";
import { useEffect } from "react";
import { useWebSocket } from "@/app/libs/ws";

export default function Page() {
  const { sendMessage, subscribe } = useWebSocket();
  const view = useViewStore((s) => s.view);
  const friendTab = useFriendTabStore((s) => s.friendTab);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // @ts-expect-error
      window.wsSendMessage = sendMessage;
    }

    subscribe(async (message, data) => {
      if (message === "get-general-user-update") {
        console.log(data?.user);
      }
    });
  }, [sendMessage, subscribe]);

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
}
