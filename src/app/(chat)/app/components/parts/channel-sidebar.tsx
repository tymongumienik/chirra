/** biome-ignore-all lint/a11y/useKeyWithClickEvents: ... */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: ... */
import { ChevronDown, Cog, Plus, Users } from "lucide-react";
import { statusColors } from "../../constants/status";
import { useViewStore } from "../../scripts/stores/view";
import { Channel } from "../channel";
import { useActiveChannelsIdStore } from "../../scripts/stores/active-channels";
import { useActiveServerIdStore } from "../../scripts/stores/active-server";
import Image from "next/image";
import { useUserStore } from "../../scripts/stores/who-am-i";
import { useSideMessageStore } from "../../scripts/stores/side-messages";
import { UserWidget } from "../user-widget";
import { initiateMessage } from "../../scripts/initiate-message";
import { useActiveDmStore } from "../../scripts/stores/active-dm";

export function ChannelSidebar() {
  const activeServerId = useActiveServerIdStore((s) => s.activeServerId);

  const user = useUserStore((s) => s.user);

  const setView = useViewStore((s) => s.setView);
  const view = useViewStore((s) => s.view);

  const setActiveChannelInServer = useActiveChannelsIdStore(
    (s) => s.setActiveChannelInServer,
  );
  const activeChannelInServer = useActiveChannelsIdStore((s) =>
    s.getActiveChannelInServer(activeServerId),
  );

  const sideMessageUsers = useSideMessageStore((s) => s.users);
  const currentDmUser = useActiveDmStore((s) => s.activeUserId);

  if (!user) return null;

  return (
    <div className="flex flex-col w-60 bg-card">
      {view === "channel" && (
        <div className="flex items-center justify-between px-4 h-12 border-b border-gray-900 shadow-sm hover:bg-gray-900 cursor-pointer">
          <span className="font-semibold text-white">My Server</span>
          <ChevronDown className="w-5 h-5 text-gray-300" />
        </div>
      )}

      {view === "friends" || view === "dm" ? (
        <div className="flex-1 overflow-y-auto">
          <div className="mb-4">
            <div
              className={`flex items-center gap-2 w-full ${view === "friends" ? "bg-gray-900/30" : "cursor-pointer hover:bg-gray-900/30"} group transition-colors px-3 py-4 mb-3`}
              onClick={() => setView("friends")}
            >
              <Users className="w-6 h-6 text-gray-400" />
              <span className="font-semibold text-white">Friends</span>
            </div>
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-300 uppercase tracking-wide px-2 hover:text-white cursor-pointer">
              Direct Messages
              <Plus className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-1">
              {sideMessageUsers.map((user) => (
                <UserWidget
                  key={user}
                  id={user}
                  topBorder={false}
                  showUserName={false}
                  onClick={() => initiateMessage(user, false)}
                  padding="px-3 py-2"
                  active={view === "dm" && currentDmUser === user}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pt-4">
          <div className="mb-4">
            <div className="flex items-center justify-between px-2 mb-1">
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-300 uppercase tracking-wide">
                <ChevronDown className="w-3 h-3" />
                Text Channels
              </div>
              <Plus className="w-4 h-4 text-gray-300 hover:text-gray-500 cursor-pointer" />
            </div>
            {[].map((channel) => (
              <Channel
                key={channel}
                name={channel}
                active={activeChannelInServer === channel}
                onClick={() =>
                  setActiveChannelInServer(activeServerId, channel)
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* User Area */}
      <div className="flex items-center gap-2 px-2 py-2 bg-background/70">
        <div className="relative">
          <Image
            src={user.profile?.avatar || "/default-avatar.png"}
            alt="Avatar"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full"
          />
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${statusColors["online"]}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-white truncate">{user.displayname}</div>
          <div className="text-xs text-gray-400 truncate">Online</div>
        </div>
        <button type="button" className="p-1 hover:bg-slate-900 rounded">
          <Cog className="w-5 h-5 text-gray-300" />
        </button>
      </div>
    </div>
  );
}
