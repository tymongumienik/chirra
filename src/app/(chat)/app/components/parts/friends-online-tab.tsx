import { initiateMessage } from "../../scripts/initiate-message";
import { useFriendsStore } from "../../scripts/stores/friends";
import { UserWidget } from "../user-widget";

export function FriendsOnlineTab() {
  const friends = useFriendsStore((s) => s.friends);

  return (
    <div className="p-2 ml-2">
      {friends
        .filter((x) => x.status === "online")
        .map((friend, idx) => (
          <UserWidget
            key={friend.id}
            id={friend.id}
            topBorder={idx !== 0}
            buttons={{
              MESSAGE: () => initiateMessage(friend.id),
            }}
            onClick={() => initiateMessage(friend.id)}
          />
        ))}
    </div>
  );
}
