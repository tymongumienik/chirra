import { useUserStore } from "../../scripts/stores/who-am-i";
import { usePendingInvitePairStore } from "../../scripts/stores/pending-invite-pairs";
import { UserWidget } from "../user-widget";
import {
  AcceptFriendRequestData,
  DeleteFriendEntryData,
} from "@/app/api/[[...slugs]]/ws/shared-schema";
import { useWebSocket } from "@/app/libs/ws";

export function FriendsPendingInvitesTab() {
  const { sendMessage } = useWebSocket();
  const user = useUserStore((s) => s.user);
  const pendingInvitePairs = usePendingInvitePairStore((s) => s.getPairs());

  const grouped = Object.groupBy(pendingInvitePairs, (pair) =>
    pair.requester.id === user?.id ? "OUTGOING" : "INCOMING",
  );

  return (
    <div>
      {grouped.OUTGOING && (
        <div className="p-2 ml-2">
          <span className="uppercase text-xs font-semibold text-gray-400">
            Outgoing
          </span>
          {grouped.OUTGOING.map((pair) => (
            <UserWidget
              key={pair.addressee.id}
              id={pair.addressee.id}
              buttons={{
                CANCEL: () => {
                  sendMessage<typeof DeleteFriendEntryData>(
                    "void:delete-friend-entry",
                    { pair },
                  );
                },
              }}
            />
          ))}
        </div>
      )}

      {grouped.INCOMING && (
        <div className="p-2 ml-2">
          <span className="uppercase text-xs font-semibold text-gray-400">
            Incoming
          </span>
          {grouped.INCOMING.map((pair) => (
            <UserWidget
              key={pair.requester.id}
              id={pair.requester.id}
              buttons={{
                ACCEPT: () => {
                  sendMessage<typeof AcceptFriendRequestData>(
                    "void:accept-friend-request",
                    { pair },
                  );
                },
                DECLINE: () => {
                  sendMessage<typeof DeleteFriendEntryData>(
                    "void:delete-friend-entry",
                    { pair },
                  );
                },
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
