import { useUserStore } from "../../scripts/stores/who-am-i";
import { UserWidget } from "../user-widget";
import { useWebSocket } from "@/app/libs/ws";
import { useFriendsStore } from "../../scripts/stores/friends";

export function FriendsAllTab() {
  const { sendMessage } = useWebSocket();
  const user = useUserStore((s) => s.user);
  const friends = useFriendsStore((s) => s.friends);

  return (
    <div className="p-2 ml-2">
      {friends.map((friendId, idx) => (
        <UserWidget key={friendId} id={friendId} topBorder={idx !== 0} />
      ))}
    </div>
  );
}
