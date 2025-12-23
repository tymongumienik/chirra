import { Users } from "lucide-react";
import {
  type FriendTab,
  useFriendTabStore,
} from "../../scripts/stores/friends-tab";

export function FriendsTopBar() {
  const setFriendTab = useFriendTabStore((s) => s.setFriendTab);
  const friendTab = useFriendTabStore((s) => s.friendTab);

  return (
    <div className="flex items-center justify-between px-8 h-12 border-b border-gray-900 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-gray-400" />
          <span className="font-semibold text-white">Friends</span>
        </div>
        <div className="h-6 w-px bg-slate-600 mx-2" />
        <div className="flex gap-1.5">
          {(["online", "all", "pending", "blocked", "add"] as FriendTab[]).map(
            (tab) => (
              <button
                key={`tab-${tab.toLowerCase()}`}
                type="button"
                onClick={() => setFriendTab(tab)}
                className={`px-2 py-0.5 rounded text-sm font-medium transition-colors ${
                  friendTab === tab
                    ? "bg-slate-800 text-white"
                    : "text-gray-300 hover:bg-slate-900 hover:text-gray-200"
                }`}
              >
                {
                  {
                    online: "Online",
                    all: "All",
                    pending: "Pending",
                    blocked: "Blocked",
                    add: "Add Friend",
                  }[tab]
                }
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
