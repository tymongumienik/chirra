import { UserWidget } from "../user-widget";
import { useFriendsStore } from "../../scripts/stores/friends";
import { initiateMessage } from "../../scripts/initiate-message";

export function FriendsAllTab() {
  const friends = useFriendsStore((s) => s.friends);

  return (
    <div className="p-2 ml-2">
      {friends.map((friend, idx) => (
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
