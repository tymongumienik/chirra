import { ChannelSidebar } from "./channel-sidebar";
import { FriendsAddTab } from "./friends-add-tab";
import { FriendsTopBar } from "./friends-top-bar";
import { ServerSidebar } from "./server-sidebar";
import { useFriendTabStore } from "../../scripts/stores/friends-tab";
import { useViewStore } from "../../scripts/stores/view";
import { useEffect } from "react";
import { useWebSocket } from "@/app/libs/ws";
import { LoadingScreen } from "@/app/libs/loading-screen";
import {
  AnnounceStatusesLetterCompiler,
  DMBriefingLetterCompiler,
  FriendsListLetterCompiler,
  PendingInvitesLetterCompiler,
  SideMessagesLetterCompiler,
  UserDetailsLetterCompiler,
} from "@/app/api/[[...slugs]]/ws/shared-schema";
import { useUserDataStore } from "../../scripts/stores/user-data";
import { usePendingInvitePairStore } from "../../scripts/stores/pending-invite-pairs";
import { FriendsPendingInvitesTab } from "./friends-pending-invites-tab";
import { useFriendsStore } from "../../scripts/stores/friends";
import { FriendsAllTab } from "./friends-all-tab";
import { FriendsOnlineTab } from "./friends-online-tab";
import { useSideMessageStore } from "../../scripts/stores/side-messages";
import { ChannelView } from "./channel-view";
import { useMessagesStore } from "../../scripts/stores/messages";

export default function Page() {
  const { subscribe, sendMessage, ready } = useWebSocket();
  const view = useViewStore((s) => s.view);
  const friendTab = useFriendTabStore((s) => s.friendTab);
  const overlayUsers = useUserDataStore((s) => s.overlayUsers);
  const overwritePendingInvitePairs = usePendingInvitePairStore(
    (s) => s.overwritePairs,
  );
  const overwriteFriends = useFriendsStore((s) => s.overwriteFriends);
  const setStatus = useFriendsStore((s) => s.setStatus);
  const setSideMessageUsers = useSideMessageStore((s) => s.setUsers);
  const setMessagesForLocation = useMessagesStore(
    (s) => s.setMessagesForLocation,
  );

  useEffect(() => {
    const interval = setInterval(() => {
      sendMessage("void:heartbeat", {});
    }, 10000);

    const unsub = subscribe((message, data) => {
      if (message === "letter:user-details") {
        if (!UserDetailsLetterCompiler.Check(data)) return;
        overlayUsers(data.users);
      }
      if (message === "letter:pending-invites") {
        if (!PendingInvitesLetterCompiler.Check(data)) return;
        overwritePendingInvitePairs(data.invites);
      }
      if (message === "letter:friends-list") {
        if (!FriendsListLetterCompiler.Check(data)) return;
        overwriteFriends(
          data.friends.map((x) => ({ id: x, status: "offline" })),
        );
      }
      if (message === "letter:announce-statuses") {
        if (!AnnounceStatusesLetterCompiler.Check(data)) return;
        for (const [id, status] of Object.entries(data.statuses)) {
          setStatus(id, status ? "online" : "offline");
        }
      }
      if (message === "letter:side-messages") {
        if (!SideMessagesLetterCompiler.Check(data)) return;
        setSideMessageUsers(data.users);
      }
      if (message === "letter:dm-briefing") {
        if (!DMBriefingLetterCompiler.Check(data)) return;
        for (const [user, msgs] of Object.entries(data.messages)) {
          setMessagesForLocation({ user }, msgs);
        }
      }
    });

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [
    sendMessage,
    subscribe,
    overlayUsers,
    overwritePendingInvitePairs,
    overwriteFriends,
    setStatus,
    setSideMessageUsers,
    setMessagesForLocation,
  ]);

  if (!ready) return <LoadingScreen />;

  return (
    <div className="flex h-screen bg-background text-white overflow-hidden inter">
      <ServerSidebar />
      <ChannelSidebar />

      {view === "friends" ? (
        <div className="flex-1 flex flex-col">
          <FriendsTopBar />

          <div className="flex-1 overflow-y-auto">
            {friendTab === "online" && <FriendsOnlineTab />}
            {friendTab === "all" && <FriendsAllTab />}
            {friendTab === "pending" && <FriendsPendingInvitesTab />}
            {/* TODO: friendTab === "blocked" */}
            {friendTab === "add" && <FriendsAddTab />}
          </div>
        </div>
      ) : (
        <ChannelView />
      )}
    </div>
  );
}
